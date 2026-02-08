# Project Title
Python Excel Converter

## Description
This project converts data into an Excel format using the `openpyxl` library. It allows users to input data and generate a formatted Excel file.

## Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/Danncode10/pythonConversionToExcel.git
   cd pythonConversionToExcel
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Folder Structure
```
pythonConversionToExcel/
│
├── .env                   # Environment variables
├── requirements.txt       # List of required Python packages
├── .gitignore             # Files and folders to be ignored by Git
├── data/                  # Directory containing input data files
│   ├── APPLICATION-for-MARRIAGE-LICENSE.xlsx
│   └── couple_img.png     # Image used in the Excel file
│
├── src/                   # Source code directory
│   └── Convert_to_excel.py # Main script for converting data to Excel
│
└── Excel/                 # Directory where generated Excel files are saved
```

## Usage Instructions
To run the script, use the following command:
```bash
python src/Convert_to_excel.py
```
This will generate an Excel file in the `Excel` folder based on the input data.