import generateAgreement from './agreementTemplate';
import mobileSafePrint from './mobileSafePrint';

export default function printAgreement(form) {
  const agreementContent = generateAgreement(form);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Catering Service Agreement</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
          }
          h1, h2 {
            color: #2c3e50;
          }
          pre {
            font-family: Arial, sans-serif;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          @media print {
            body {
              margin: 0;
              padding: 10mm;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          }
          @media (max-width: 768px) {
            body {
              padding: 12px;
              font-size: 14px;
              line-height: 1.5;
            }
            pre {
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        <pre>${agreementContent}</pre>
      </body>
    </html>
  `;
  
  mobileSafePrint(htmlContent, {
    title: 'Catering Service Agreement',
    delay: 500,
    onSuccess: () => console.log('Agreement printed successfully'),
    onError: (err) => console.error('Print failed:', err)
  });
}
