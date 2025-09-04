#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use base64::Engine;
use screenshots::Screen;

#[command]
async fn get_screen_info() -> std::result::Result<String, String> {
    let screens = Screen::all().map_err(|e| format!("Failed to get screens: {}", e))?;
    
    let mut info = String::new();
    info.push_str(&format!("Found {} screen(s):\n", screens.len()));
    
    for (i, screen) in screens.iter().enumerate() {
        let display = &screen.display_info;
        info.push_str(&format!(
            "Screen {}: {}x{} at ({}, {}) - Primary: {}\n",
            i + 1,
            display.width,
            display.height,
            display.x,
            display.y,
            display.is_primary
        ));
    }
    
    Ok(info)
}

#[command]
async fn capture_screenshot() -> std::result::Result<String, String> {
    let screens = Screen::all().map_err(|e| format!("Failed to get screens: {}", e))?;
    
    if screens.is_empty() {
        return Err("No screens found".to_string());
    }
    
    let primary_screen = screens.iter()
        .find(|screen| screen.display_info.is_primary)
        .unwrap_or(&screens[0]);
    
    println!("Capturing screen: {}x{} at ({}, {})", 
             primary_screen.display_info.width, 
             primary_screen.display_info.height,
             primary_screen.display_info.x,
             primary_screen.display_info.y);
    
    let captured_image = primary_screen.capture().map_err(|e| {
        eprintln!("Failed to capture screen: {}", e);
        format!("Failed to capture screen: {}", e)
    })?;
    
    println!("Captured image dimensions: {}x{}", captured_image.width(), captured_image.height());
    
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let temp_path = std::env::temp_dir().join(format!("loopie_screenshot_{}.png", timestamp));
    
    captured_image.save(&temp_path).map_err(|e| format!("Failed to save screenshot: {}", e))?;
    
    let png_data = std::fs::read(&temp_path).map_err(|e| format!("Failed to read screenshot file: {}", e))?;
    
    let _ = std::fs::remove_file(&temp_path);
    
    if png_data.len() < 8 || &png_data[0..8] != b"\x89PNG\r\n\x1a\n" {
        return Err(format!("Invalid PNG data generated. First 8 bytes: {:?}", &png_data[0..8.min(png_data.len())]));
    }
    
    let base64_string = base64::engine::general_purpose::STANDARD.encode(&png_data);
    let data_url = format!("data:image/png;base64,{}", base64_string);
    
    println!("Screenshot encoded successfully, PNG size: {} bytes, base64 length: {}", 
             png_data.len(), base64_string.len());
    Ok(data_url)
}

#[command]
async fn capture_all_screens() -> Result<String, String> {
    capture_screenshot().await
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_screenshots::init())
        .invoke_handler(tauri::generate_handler![
            capture_screenshot, 
            capture_all_screens, 
            get_screen_info
        ])
        .setup(|_app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}