// utils/documentTypeTranslations.ts
export const documentTypeTranslations: Record<string, string> = {
  // Facturas y documentos de venta
  quote: "Cotización",
  invoice: "Factura",
  delivery_note: "Nota de Entrega",
  sales_return: "Devolución de Venta",
  return_delivery_note: "Nota de Entrega de Devolución",

  // Documentos de compra
  purchase_requisition: "Requisición de Compra",
  purchase_order: "Orden de Compra",
  purchase_receipt: "Recibo de Compra",
  purchase_invoice: "Factura de Compra",

  // Movimientos de inventario
  inventory_movement_outcome: "Salida de Inventario",
  inventory_movement_income: "Entrada de Inventario",
  inventory_movement_transfer: "Transferencia de Inventario",
};
