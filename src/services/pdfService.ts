import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Module } from '../types/quotation';

export class PDFService {
  async generateProfessionalPDF(
    clientName: string,
    projectType: string,
    selectedModules: Module[],
    totalAmount: number,
    usdRate: number,
    isDarkTheme: boolean = false,
    customContent?: {
      companyEmail?: string;
      companyPhone?: string;
      notes?: string;
      terms?: string[];
    }
  ): Promise<void> {
    if (!clientName.trim()) {
      throw new Error('Por favor, ingresa el nombre del cliente antes de generar el PDF.');
    }

    if (selectedModules.length === 0) {
      throw new Error('Por favor, selecciona al menos un módulo para generar la cotización.');
    }

    const pdfContent = this.createPDFContent(clientName, projectType, selectedModules, totalAmount, usdRate, isDarkTheme, customContent);
    
    // Create temporary container for rendering
    const container = document.createElement('div');
    container.innerHTML = pdfContent;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.backgroundColor = isDarkTheme ? '#1f2937' : 'white';
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff',
        width: 800,
        allowTaint: false,
        logging: false
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `Cotizacion-WebNovaLab-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } finally {
      // Cleanup
      document.body.removeChild(container);
    }
  }

  createPDFContent(
    clientName: string,
    projectType: string,
    selectedModules: Module[],
    totalAmount: number,
    usdRate: number,
    isDarkTheme: boolean = false,
    customContent?: {
      companyEmail?: string;
      companyPhone?: string;
      notes?: string;
      terms?: string[];
    }
  ): string {
    const currentDate = new Date().toLocaleDateString('es-DO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const bgColor = isDarkTheme ? '#1f2937' : 'white';
    const textColor = isDarkTheme ? '#f9fafb' : '#1f2937';
    const secondaryBg = isDarkTheme ? '#374151' : '#f8fafc';
    const borderColor = isDarkTheme ? '#4b5563' : '#5EEAD4';

    const companyEmail = customContent?.companyEmail || "info.webnovalab@gmail.com";
    const companyPhone = customContent?.companyPhone || "+1 (809) 123-4567";

    // Preserve user line breaks by converting newlines to <br> tags
    const formatMultilineText = (text: string) =>
      text.replace(/\n/g, '<br/>');

    const finalNotes = customContent?.notes
      ? formatMultilineText(customContent.notes)
      : "Gracias por la oportunidad de cotizar para su proyecto. ¡Esperamos trabajar con ustedes!";

    const terms = (customContent?.terms || [
      "El proyecto incluye 2 rondas de revisiones sin costo adicional",
      "Cambios mayores fuera del alcance original se cotizarán por separado",
      "El cliente debe proporcionar contenido y materiales dentro de 5 días hábiles",
      "Garantía de 3 meses en funcionalidades desarrolladas",
      "Soporte técnico gratuito por 30 días post-entrega"
    ]).map(term => formatMultilineText(term));

    return `
      <div style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 40px; background: ${bgColor}; color: ${textColor}; line-height: 1.6;">
        <!-- Header -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: center; padding: 40px 0; border-bottom: 3px solid ${borderColor}; margin-bottom: 40px;">
          <div>
            <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 50%; color: white; font-size: 32px; text-align: center; width: 60px; height: 60px; margin-bottom: 20px;">
              ⚡
            </div>
            <h1 style="font-size: 36px; font-weight: 900; margin: 0; color: ${textColor};">
              WebNova<span style="color: #5EEAD4;">Lab</span>
            </h1>
            <p style="color: ${isDarkTheme ? '#9ca3af' : '#6b7280'}; margin: 0;">Soluciones Web y Marketing Digital</p>
          </div>
          <div style="text-align: right; color: ${textColor};">
            <h2 style="font-size: 28px; margin: 0; color: #5EEAD4;">Cotización de Proyecto Web</h2>
            <p style="margin: 5px 0;">Fecha: ${currentDate}</p>
            <p style="margin: 0;">Válida por 30 días</p>
          </div>
        </div>

        <!-- Client Information -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; padding: 30px; background: ${secondaryBg}; border-radius: 12px; border-left: 4px solid ${borderColor};">
          <div>
            <div style="font-size: 12px; font-weight: 600; color: ${isDarkTheme ? '#9ca3af' : '#6b7280'}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px;">
              Preparado Para
            </div>
            <p style="font-size: 18px; font-weight: 700; margin: 0; color: ${textColor};">${clientName}</p>
            <p style="color: ${isDarkTheme ? '#9ca3af' : '#6b7280'}; margin: 0;">${projectType || 'Proyecto Web Personalizado'}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; font-weight: 600; color: ${isDarkTheme ? '#9ca3af' : '#6b7280'}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px;">
              Preparado Por
            </div>
            <p style="font-size: 18px; font-weight: 700; margin: 0; color: ${textColor};">Web Nova Lab</p>
            <p style="color: ${isDarkTheme ? '#9ca3af' : '#6b7280'}; margin: 0;">Soluciones Web y Marketing</p>
            <p style="color: #5EEAD4; margin: 0;">${companyEmail}</p>
          </div>
        </div>

        <!-- Modules Table -->
        <h3 style="font-size: 24px; color: ${textColor}; margin-bottom: 20px; border-bottom: 2px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'}; padding-bottom: 10px; font-weight: 700;">
          🧾 Detalle por Módulos
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: ${isDarkTheme ? '#374151' : '#f9fafb'};">
              <th style="padding: 16px; text-align: left; font-weight: 600; color: ${isDarkTheme ? '#f3f4f6' : '#374151'}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                Módulo / Entregable
              </th>
              <th style="padding: 16px; text-align: left; font-weight: 600; color: ${isDarkTheme ? '#f3f4f6' : '#374151'}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                Descripción
              </th>
              <th style="padding: 16px; text-align: right; font-weight: 600; color: ${isDarkTheme ? '#f3f4f6' : '#374151'}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                Valor (RD$)
              </th>
            </tr>
          </thead>
          <tbody>
            ${selectedModules.map((module, index) => `
              <tr style="${index % 2 === 1 ? `background: ${isDarkTheme ? '#374151' : '#f9fafb'};` : `background: ${bgColor};`} page-break-inside: avoid;">
                <td style="padding: 12px; vertical-align: top; ${index === selectedModules.length - 1 ? '' : `border-bottom: 1px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'};`} font-weight: 600; color: ${textColor}; word-break: break-word;">
                  ${module.name}
                </td>
                <td style="padding: 12px; vertical-align: top; ${index === selectedModules.length - 1 ? '' : `border-bottom: 1px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'};`} color: ${textColor}; word-break: break-word; max-width: 300px;">
                  ${module.description}
                </td>
                <td style="padding: 12px; vertical-align: top; ${index === selectedModules.length - 1 ? '' : `border-bottom: 1px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'};`} text-align: right; font-family: monospace; font-weight: 600; color: #059669; white-space: nowrap;">
                  ${module.price.toLocaleString()}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Total Section -->
        <div style="background: linear-gradient(135deg, #14b8a6, #0d9488); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 30px;">
          <h3 style="margin: 0 0 10px 0;">✅ Total Final a Pagar</h3>
          <div style="font-size: 36px; font-weight: 900; margin: 10px 0;">
            RD$ ${totalAmount.toLocaleString()}
          </div>
          <p style="margin: 0;">(≈ US$ ${usdRate ? Math.round(totalAmount / usdRate) : '...'} al tipo de cambio RD$ ${usdRate || '...'})</p>
        </div>

        <!-- Payment Schedule -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0;">
          <div>
            <h3 style="font-size: 24px; color: ${textColor}; margin-bottom: 20px; border-bottom: 2px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'}; padding-bottom: 10px; font-weight: 700;">
              📅 Cronograma de Entregas
            </h3>
            <ul style="padding-left: 20px; color: ${isDarkTheme ? '#9ca3af' : '#6b7280'};">
              <li style="margin-bottom: 8px;"><strong style="color: #5EEAD4;">Semana 1-2:</strong> Diseño y desarrollo inicial</li>
              <li style="margin-bottom: 8px;"><strong style="color: #5EEAD4;">Semana 3-4:</strong> Funcionalidades core y backend</li>
              <li style="margin-bottom: 8px;"><strong style="color: #5EEAD4;">Semana 5-6:</strong> Integraciones y testing</li>
              <li style="margin-bottom: 8px;"><strong style="color: #5EEAD4;">Semana 7-8:</strong> Despliegue y entrega final</li>
            </ul>
          </div>
          <div>
            <h3 style="font-size: 24px; color: ${textColor}; margin-bottom: 20px; border-bottom: 2px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'}; padding-bottom: 10px; font-weight: 700;">
              💳 Forma de Pago
            </h3>
            <div style="padding: 20px; background: ${isDarkTheme ? '#374151' : '#f1f5f9'}; border-radius: 8px; text-align: center; margin-bottom: 15px;">
              <p style="font-weight: 600; margin-bottom: 10px; color: ${textColor};">50% al iniciar</p>
              <p style="font-size: 24px; font-weight: 900; color: #5EEAD4; margin: 0;">
                RD$ ${Math.round(totalAmount / 2).toLocaleString()}
              </p>
            </div>
            <div style="padding: 20px; background: ${isDarkTheme ? '#374151' : '#f1f5f9'}; border-radius: 8px; text-align: center;">
              <p style="font-weight: 600; margin-bottom: 10px; color: ${textColor};">50% al entregar</p>
              <p style="font-size: 24px; font-weight: 900; color: #5EEAD4; margin: 0;">
                RD$ ${Math.round(totalAmount / 2).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div style="margin-top: 40px; padding: 20px; background: ${secondaryBg}; border-radius: 8px; border-left: 4px solid ${borderColor}; page-break-inside: avoid;">
          <h4 style="color: ${textColor}; margin-bottom: 15px;">📋 Términos y Condiciones</h4>
          <ul style="color: ${isDarkTheme ? '#9ca3af' : '#6b7280'}; font-size: 14px; line-height: 1.6;">
            ${terms.map(term => `<li style="margin-bottom: 8px;">${term}</li>`).join('')}
          </ul>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'}; text-align: center; color: ${isDarkTheme ? '#9ca3af' : '#6b7280'}; font-size: 12px; page-break-inside: avoid;">
          <p>${finalNotes}</p>
          <p style="margin-top: 15px;"><strong style="color: #5EEAD4; font-weight: 600;">Web Nova Lab</strong> - Transformamos ideas en soluciones digitales exitosas</p>
          <p style="margin-top: 10px;">📧 ${companyEmail} | 📱 WhatsApp: ${companyPhone}</p>
        </div>
      </div>
    `;
  }
}