mod commands;
mod database;
mod types;

use database::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Database::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(db)
        .invoke_handler(tauri::generate_handler![
            commands::add_project,
            commands::list_projects,
            commands::delete_project,
            commands::update_project,
            commands::scan_env_files,
            commands::activate_env,
            commands::get_active_env,
            commands::read_env_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
