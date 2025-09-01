import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BirthChartData {
  name: string;
  date: string;
  time: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface BirthChart {
  ascendant: {
    longitude: number;
    sign: string;
    degreeInSign: number;
  };
  midheaven: {
    longitude: number;
    sign: string;
    degreeInSign: number;
  };
  planets: Array<{
    planet: string;
    symbol: string;
    longitude: number;
    sign: string;
    degreeInSign: number;
    speed: number;
    house: number;
    isRetrograde: boolean;
  }>;
  houses: Array<{
    house: number;
    longitude: number;
    sign: string;
    degreeInSign: number;
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
  metadata: {
    julianDay: number;
    localTime: string;
    utcTime: string;
    timezone: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export class PDFExporter {
  /**
   * Export birth chart as PDF with diagram
   */
  static async exportBirthChartPDF(
    birthData: BirthChartData,
    birthChart: BirthChart,
    chartElementId: string = 'birth-chart-container'
  ): Promise<void> {
    try {
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Set up fonts and colors
      pdf.setFont('helvetica');
      
      // Add header
      this.addHeader(pdf, birthData, pageWidth);
      
      // Capture the chart diagram
      const chartElement = document.getElementById(chartElementId);
      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#0a0a0a', // Dark background to match the theme
          scale: 2, // Higher resolution
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add chart image
        pdf.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);
        
        // Add chart data below the image
        let currentY = 50 + imgHeight + 10;
        currentY = this.addChartData(pdf, birthChart, pageWidth, currentY);
        
        // Check if we need a new page for aspects
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          currentY = 20;
        }
        
        // Add aspects
        currentY = this.addAspects(pdf, birthChart.aspects, pageWidth, currentY);
      } else {
        // Fallback: add chart data without image
        let currentY = 50;
        currentY = this.addChartData(pdf, birthChart, pageWidth, currentY);
        
        // Check if we need a new page for aspects
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          currentY = 20;
        }
        
        currentY = this.addAspects(pdf, birthChart.aspects, pageWidth, currentY);
      }
      
      // Add footer to the last page
      this.addFooter(pdf, pageWidth, pageHeight);
      
      // Save the PDF
      const fileName = `${birthData.name.replace(/\s+/g, '_')}_BirthChart_${birthData.date}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }
  
  /**
   * Add header to PDF
   */
  private static addHeader(pdf: jsPDF, birthData: BirthChartData, pageWidth: number): void {
    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(100, 200, 255); // Light blue color
    pdf.text('Birth Chart Analysis', pageWidth / 2, 20, { align: 'center' });
    
    // Birth data
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255); // White color
    pdf.text(`${birthData.name}`, 20, 30);
    pdf.text(`Born: ${birthData.date} at ${birthData.time}`, 20, 35);
    pdf.text(`Location: ${birthData.city}, ${birthData.country}`, 20, 40);
    
    if (birthData.coordinates) {
      pdf.text(`Coordinates: ${birthData.coordinates.lat.toFixed(4)}°N, ${birthData.coordinates.lng.toFixed(4)}°E`, 20, 45);
    }
  }
  
  /**
   * Add comprehensive chart data to PDF
   */
  private static addChartData(pdf: jsPDF, birthChart: BirthChart, pageWidth: number, startY: number): number {
    let currentY = startY;
    
    // Chart metadata
    pdf.setFontSize(12);
    pdf.setTextColor(100, 200, 255); // Light blue
    pdf.text('Chart Details', 20, currentY);
    currentY += 8;
    
    pdf.setFontSize(9);
    pdf.setTextColor(200, 200, 200);
    pdf.text(`Julian Day: ${birthChart.metadata.julianDay}`, 20, currentY);
    currentY += 5;
    pdf.text(`Local Time: ${birthChart.metadata.localTime}`, 20, currentY);
    currentY += 5;
    pdf.text(`UTC Time: ${birthChart.metadata.utcTime}`, 20, currentY);
    currentY += 5;
    pdf.text(`Timezone: ${birthChart.metadata.timezone}`, 20, currentY);
    currentY += 5;
    pdf.text(`Coordinates: ${birthChart.metadata.coordinates.lat.toFixed(4)}°N, ${birthChart.metadata.coordinates.lng.toFixed(4)}°E`, 20, currentY);
    currentY += 10;
    
    // Ascendant and Midheaven
    pdf.setFontSize(12);
    pdf.setTextColor(100, 200, 255);
    pdf.text('Key Points', 20, currentY);
    currentY += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(200, 200, 200);
    pdf.text(`Ascendant: ${birthChart.ascendant.sign} ${birthChart.ascendant.degreeInSign.toFixed(2)}° (${birthChart.ascendant.longitude.toFixed(3)}°)`, 20, currentY);
    currentY += 6;
    pdf.text(`Midheaven: ${birthChart.midheaven.sign} ${birthChart.midheaven.degreeInSign.toFixed(2)}° (${birthChart.midheaven.longitude.toFixed(3)}°)`, 20, currentY);
    currentY += 10;
    
    // Planetary positions
    pdf.setFontSize(12);
    pdf.setTextColor(100, 200, 255);
    pdf.text('Planetary Positions', 20, currentY);
    currentY += 8;
    
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    
    // Create a table-like format for planets
    pdf.text('Planet', 20, currentY);
    pdf.text('Sign', 50, currentY);
    pdf.text('Degree', 80, currentY);
    pdf.text('Longitude', 100, currentY);
    pdf.text('Speed', 130, currentY);
    pdf.text('House', 150, currentY);
    currentY += 6;
    
    // Draw a line
    pdf.setDrawColor(100, 200, 255);
    pdf.line(20, currentY, pageWidth - 20, currentY);
    currentY += 4;
    
    birthChart.planets.forEach(planet => {
      const retrograde = planet.isRetrograde ? ' (R)' : '';
      pdf.text(`${planet.symbol} ${planet.planet}${retrograde}`, 20, currentY);
      pdf.text(planet.sign, 50, currentY);
      pdf.text(`${planet.degreeInSign.toFixed(2)}°`, 80, currentY);
      pdf.text(`${planet.longitude.toFixed(3)}°`, 100, currentY);
      pdf.text(`${planet.speed.toFixed(4)}°/d`, 130, currentY);
      pdf.text(`H${planet.house}`, 150, currentY);
      currentY += 5;
    });
    
    currentY += 10;
    
    // House cusps
    pdf.setFontSize(12);
    pdf.setTextColor(100, 200, 255);
    pdf.text('House Cusps', 20, currentY);
    currentY += 8;
    
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    
    // House cusps table
    pdf.text('House', 20, currentY);
    pdf.text('Sign', 40, currentY);
    pdf.text('Degree', 70, currentY);
    pdf.text('Longitude', 100, currentY);
    currentY += 6;
    
    // Draw a line
    pdf.setDrawColor(100, 200, 255);
    pdf.line(20, currentY, pageWidth - 20, currentY);
    currentY += 4;
    
    birthChart.houses.forEach(house => {
      pdf.text(`H${house.house}`, 20, currentY);
      pdf.text(house.sign, 40, currentY);
      pdf.text(`${house.degreeInSign.toFixed(2)}°`, 70, currentY);
      pdf.text(`${house.longitude.toFixed(3)}°`, 100, currentY);
      currentY += 5;
    });
    
    return currentY + 10;
  }
  
  /**
   * Add aspects to PDF
   */
  private static addAspects(pdf: jsPDF, aspects: any[], pageWidth: number, startY: number): number {
    if (aspects.length === 0) return startY;
    
    let currentY = startY;
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 200, 255);
    pdf.text('Major Aspects', 20, currentY);
    currentY += 8;
    
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    
    // Create aspects table
    pdf.text('Planet 1', 20, currentY);
    pdf.text('Aspect', 50, currentY);
    pdf.text('Planet 2', 80, currentY);
    pdf.text('Orb', 120, currentY);
    currentY += 6;
    
    // Draw a line
    pdf.setDrawColor(100, 200, 255);
    pdf.line(20, currentY, pageWidth - 20, currentY);
    currentY += 4;
    
    // Show all aspects
    aspects.forEach(aspect => {
      pdf.text(aspect.planet1, 20, currentY);
      pdf.text(aspect.aspect, 50, currentY);
      pdf.text(aspect.planet2, 80, currentY);
      pdf.text(`${aspect.orb.toFixed(1)}°`, 120, currentY);
      currentY += 5;
    });
    
    return currentY + 10;
  }
  
  /**
   * Add footer to PDF
   */
  private static addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Generated by Cosmic Connections AI', pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text('This analysis is for entertainment and self-reflection purposes only.', pageWidth / 2, pageHeight - 5, { align: 'center' });
  }
  
  /**
   * Export birth chart as PNG image
   */
  static async exportBirthChartPNG(
    birthData: BirthChartData,
    chartElementId: string = 'birth-chart-container'
  ): Promise<void> {
    try {
      const chartElement = document.getElementById(chartElementId);
      if (!chartElement) {
        throw new Error('Birth chart element not found');
      }

      // Capture the chart element as canvas
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#0a0a0a', // Dark background to match the theme
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: chartElement.scrollWidth,
        height: chartElement.scrollHeight
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png', 1.0);
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${birthData.name.replace(/\s+/g, '_')}_BirthChart_${birthData.date}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating PNG:', error);
      throw new Error('Failed to generate PNG. Please try again.');
    }
  }
}
