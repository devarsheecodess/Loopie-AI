import { atom } from "jotai";

export const settingsVisibleAtom = atom(false);
export const calendarVisibleAtom = atom(false);
export const chatVisibleAtom = atom(false);
export const dashboardVisibleAtom = atom(false);
export const recordingAtom = atom(false);
export const credentialsAtom = atom({ geminiKey: "", groqKey: "" });
export const screenshotAtom = atom(null);