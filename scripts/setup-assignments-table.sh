#!/bin/bash

echo "========================================"
echo "SETUP ASSIGNMENTS TABLE - SUPABASE"
echo "========================================"
echo

echo "Script ini akan membantu Anda setup tabel assignments di Supabase."
echo

show_menu() {
    echo "Pilihan setup:"
    echo "1. Tampilkan SQL script untuk di-copy ke Supabase Dashboard"
    echo "2. Buka dokumentasi setup"
    echo "3. Keluar"
    echo
    read -p "Masukkan pilihan (1-3): " choice
    
    case $choice in
        1) show_sql ;;
        2) open_docs ;;
        3) exit_script ;;
        *) invalid_choice ;;
    esac
}

show_sql() {
    echo
    echo "========================================"
    echo "SQL SCRIPT UNTUK SUPABASE"
    echo "========================================"
    echo
    echo "Copy script berikut ke Supabase SQL Editor:"
    echo
    cat "database/create_assignments_table.sql"
    echo
    echo "========================================"
    echo "LANGKAH SELANJUTNYA:"
    echo "========================================"
    echo "1. Buka Supabase Dashboard: https://app.supabase.com"
    echo "2. Pilih project Anda"
    echo "3. Ke menu SQL Editor"
    echo "4. Paste script di atas"
    echo "5. Klik Run"
    echo "6. Test di aplikasi dengan membuat tugas baru"
    echo
    read -p "Tekan Enter untuk melanjutkan..."
    show_menu
}

open_docs() {
    echo
    echo "Membuka dokumentasi setup..."
    
    # Try different commands to open the file based on OS
    if command -v xdg-open > /dev/null; then
        xdg-open "ASSIGNMENTS_TABLE_SETUP.md"
    elif command -v open > /dev/null; then
        open "ASSIGNMENTS_TABLE_SETUP.md"
    elif command -v start > /dev/null; then
        start "ASSIGNMENTS_TABLE_SETUP.md"
    else
        echo "File dokumentasi: ASSIGNMENTS_TABLE_SETUP.md"
        echo "Silakan buka file tersebut secara manual."
    fi
    
    show_menu
}

invalid_choice() {
    echo
    echo "Pilihan tidak valid. Silakan pilih 1-3."
    echo
    show_menu
}

exit_script() {
    echo
    echo "Terima kasih! Jangan lupa setup tabel assignments di Supabase."
    echo
    exit 0
}

# Main execution
show_menu
