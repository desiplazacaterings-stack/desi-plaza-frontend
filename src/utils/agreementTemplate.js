export default function generateAgreement(form) {
  return `<div style="line-height: 1.6; font-size: 0.85em;">
<h2 style="text-align: center; margin: 20px 0 10px 0; font-size: 1.3em;">CATERING SERVICE AGREEMENT</h2>

This agreement is entered into on ${new Date().toLocaleDateString()} between:

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">1. PARTIES</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
Service Provider: Desi Plaza Caterings<br>
Client: ${form.customerName}<br>
Contact Number: ${form.mobile}<br>
Email: ${form.email}
</div>

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">2. EVENT DETAILS</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
Event Type: ${form.eventType}<br>
Event Date: ${form.eventDate}<br>
Event Time: ${form.eventTime}<br>
Number of Guests: ${form.guests}<br>
Location: ${form.location}
</div>

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">3. SERVICES PROVIDED</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
Desi Plaza Caterings will provide catering services including food preparation and delivery as discussed. The final menu and quantity of food will be confirmed by both parties before the event date. Pricing will be provided separately based on the menu selection and number of guests.
</div>

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">4. SPECIAL REQUESTS & NOTES</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
${form.notes || 'No special requests noted'}
</div>

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">5. PRICING & PAYMENT</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
• A deposit of 25% of the total estimated cost is required to confirm the booking<br>
• The remaining balance is due 7 days before the event date<br>
• Payment can be made via cash, check, or electronic transfer<br>
• Prices are subject to change based on final menu confirmation and guest count
</div>

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">6. CANCELLATION POLICY</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
• Cancellations made more than 30 days before the event: Full refund of deposit<br>
• Cancellations made 15-30 days before the event: 50% of deposit retained<br>
• Cancellations made less than 15 days before the event: No refund of deposit<br>
• Desi Plaza Caterings reserves the right to cancel with 14 days notice and full refund
</div>

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">7. CLIENT RESPONSIBILITIES</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
• Provide accurate guest count at least 7 days before the event<br>
• Ensure venue is accessible and has adequate space for food setup<br>
• Arrange tables, chairs, and serving equipment if not provided by caterer<br>
• Notify Desi Plaza Caterings of any dietary restrictions at the time of booking<br>
• Provide parking access for catering vehicle if applicable
</div>

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">8. FOOD SAFETY</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
Desi Plaza Caterings maintains proper food handling and sanitation practices. We follow industry standards for food storage, preparation, and serving. The client is responsible for informing us of any known allergies or dietary restrictions.
</div>

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">9. LIMITATION OF LIABILITY</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
Desi Plaza Caterings is not responsible for injuries, lost items, or property damage during the event. The client assumes all risk and agrees to hold Desi Plaza Caterings harmless from any claims arising from the event.
</div>

<h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 1.05em;">10. AGREEMENT ACCEPTANCE</h3>
<div style="margin-left: 20px; margin-bottom: 15px;">
By signing below, both parties agree to all terms outlined in this agreement. Any changes must be requested in writing and agreed upon by both parties.
</div>

11. SIGNATURES

<div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #333;">

<h4 style="margin: 20px 0 10px 0; font-size: 1em;">CLIENT:</h4>
<div style="margin-left: 20px;">
Name (Printed): ${form.customerName}<br><br>
Signature: ________________________     Date: __________
</div>

<h4 style="margin: 30px 0 10px 0; font-size: 1em;">DESI PLAZA CATERINGS:</h4>
<div style="margin-left: 20px;">
Authorized Representative: ________________________<br><br>
Signature: ________________________     Date: __________
</div>

</div>

<div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; text-align: center;">
<p style="margin-bottom: 10px;"><strong>For inquiries, contact:</strong></p>
<div>
Desi Plaza Caterings<br>
Phone: ${form.mobile}<br>
Email: ${form.email}
</div>
</div>

</div>`;
}
