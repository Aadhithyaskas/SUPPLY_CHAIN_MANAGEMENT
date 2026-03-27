import pdfplumber
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from django.conf import settings
import os
from datetime import datetime

def parse_vendor_invoice(file_obj):
    """
    Parses a PDF invoice to extract SKU, Quantity, and Price.
    Expects a table structure: [SKU, Name, Qty, Price]
    """
    extracted_items = []
    with pdfplumber.open(file_obj) as pdf:
        # Assuming the data is on the first page
        table = pdf.pages[0].extract_table()
        if not table:
            raise ValueError("No table found in the PDF invoice.")

        # Skip header row (index 0)
        for row in table[1:]:
            # Clean data: remove currency symbols and handle empty strings
            try:
                sku = str(row[0]).strip()
                qty = int(row[2])
                price = float(str(row[3]).replace('$', '').replace(',', '').strip())
                
                extracted_items.append({
                    "sku": sku,
                    "quantity": qty,
                    "price": price
                })
            except (ValueError, IndexError, TypeError):
                continue # Skip malformed rows
                
    return extracted_items

def generate_supplier_invoice_pdf(items, supplier_name, profit_margin):
    """
    Generates a new Invoice PDF with added profit.
    Returns the file path.
    """
    filename = f"Invoice_to_Supplier_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    file_path = os.path.join(settings.MEDIA_ROOT, 'invoices', filename)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    # --- Header ---
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "TAX INVOICE")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 70, f"Bill To: {supplier_name}")
    c.drawString(50, height - 85, f"Date: {datetime.now().strftime('%d-%m-%Y')}")

    # --- Table Headers ---
    y = height - 130
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y, "Product Name")
    c.drawString(300, y, "Qty")
    c.drawString(380, y, "Unit Price (Inc. Profit)")
    c.drawString(500, y, "Total")
    c.line(50, y - 5, 550, y - 5)

    # --- Line Items ---
    y -= 25
    c.setFont("Helvetica", 10)
    grand_total = 0
    
    for item in items:
        # Drawing the data
        c.drawString(50, y, item['product_name'][:40])
        c.drawString(300, y, str(item['quantity']))
        c.drawString(380, y, f"{item['new_price']:.2f}")
        c.drawString(500, y, f"{item['total']:.2f}")
        
        grand_total += item['total']
        y -= 20
        
        # Simple Page Break Logic
        if y < 100:
            c.showPage()
            y = height - 50

    # --- Footer ---
    c.line(50, y, 550, y)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(400, y - 25, f"Grand Total: {grand_total:.2f}")

    c.save()
    return f"{settings.MEDIA_URL}invoices/{filename}"