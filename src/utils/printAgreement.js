import generateAgreement from './agreementTemplate';

export default function printAgreement(form) {
  const agreementContent = generateAgreement(form);
  
  const printWindow = window.open('', '', 'height=800,width=800');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Catering Service Agreement</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 20px;
            color: #333;
          }
          h1, h2 {
            color: #2c3e50;
          }
          pre {
            font-family: Arial, sans-serif;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <pre>${agreementContent}</pre>
        <script>
          window.print();
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
