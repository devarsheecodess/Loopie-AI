// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        // add other plugins if needed, e.g. .plugin(tauri_plugin_someother::init())
        .setup(|app| {
            // Additional setup if you need it (optional)
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
