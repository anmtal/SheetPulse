/* ----------------------------------------------------
   SheetPulse Application Script - High-Fidelity Simulation
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Left Panel (Controls)
    const btnOAuth = document.getElementById('btn-oauth');
    const sheetSelectorContainer = document.getElementById('sheet-selector-container');
    const selectSheet = document.getElementById('select-sheet');
    const inputCalendly = document.getElementById('input-calendly');
    const inputSMSBody = document.getElementById('input-sms-body');
    const btnProvision = document.getElementById('btn-provision');
    const numberDetails = document.getElementById('number-details');
    const allocatedNumber = document.getElementById('allocated-number');
    const leadName = document.getElementById('lead-name');
    const leadPhone = document.getElementById('lead-phone');
    const leadService = document.getElementById('lead-service');
    const toggleRealMode = document.getElementById('toggle-real-mode');
    const realModeInputs = document.getElementById('real-mode-inputs');
    const inputWebhook = document.getElementById('input-webhook');
    const btnTrigger = document.getElementById('btn-trigger');

    // DOM Elements - Right Panel (Visuals)
    const engineStatus = document.getElementById('engine-status');
    const nodeSheet = document.getElementById('node-sheet');
    const nodeApp = document.getElementById('node-app');
    const nodeTwilio = document.getElementById('node-twilio');
    const statusSheet = document.getElementById('status-sheet');
    const statusApp = document.getElementById('status-app');
    const statusTwilio = document.getElementById('status-twilio');
    const path1 = document.getElementById('path-1');
    const path2 = document.getElementById('path-2');

    // Smartphone Display Elements
    const phoneSenderName = document.getElementById('phone-sender-name');
    const phoneMessagesBody = document.getElementById('phone-messages-body');
    const smartphone = document.querySelector('.smartphone');

    // State Variables
    let isSheetsConnected = false;
    let isNumberProvisioned = false;
    let localNumber = '+1 (647) 555-0149';

    // --------------------------------------------------------
    // Web Audio API Sound Generator (Beep Sound for SMS Ping)
    // --------------------------------------------------------
    function playSMSNotificationSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            
            // Double-tone rapid notification chime
            const now = ctx.currentTime;
            
            // Note 1
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, now); // D5 note
            gain1.gain.setValueAtTime(0.15, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.15);

            // Note 2 (slightly higher, delayed)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880.00, now + 0.08); // A5 note
            gain2.gain.setValueAtTime(0.15, now + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.3);
            
        } catch (e) {
            console.log('Audio Context blocked or not supported: ', e);
        }
    }

    // Toggle Real Mode Inputs
    toggleRealMode.addEventListener('change', () => {
        if (toggleRealMode.checked) {
            realModeInputs.classList.remove('hidden');
        } else {
            realModeInputs.classList.add('hidden');
        }
    });

    // --------------------------------------------------------
    // Step 1: Connect Google Sheets (Simulated OAuth)
    // --------------------------------------------------------
    btnOAuth.addEventListener('click', () => {
        if (isSheetsConnected) return;

        btnOAuth.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting to Google Account...';
        btnOAuth.disabled = true;

        setTimeout(() => {
            isSheetsConnected = true;
            btnOAuth.innerHTML = '<i class="fa-solid fa-circle-check"></i> Google Sheets Connected';
            btnOAuth.classList.remove('btn-outline');
            btnOAuth.style.background = 'rgba(52, 168, 83, 0.15)';
            btnOAuth.style.borderColor = '#34a853';
            btnOAuth.style.color = '#34a853';
            btnOAuth.disabled = true;

            // Unhide sheet selector dropdown
            sheetSelectorContainer.classList.remove('hidden');
        }, 1200);
    });

    // Handle spreadsheet selection
    selectSheet.addEventListener('change', () => {
        if (selectSheet.value !== '') {
            // Unlock step 2 provision button
            btnProvision.disabled = false;
        } else {
            btnProvision.disabled = true;
        }
    });

    // --------------------------------------------------------
    // Step 2: Reserve Dedicated Local Number (Provisioning)
    // --------------------------------------------------------
    btnProvision.addEventListener('click', () => {
        if (isNumberProvisioned) return;

        btnProvision.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Searching and Registering A2P Brand...';
        btnProvision.disabled = true;

        setTimeout(() => {
            isNumberProvisioned = true;
            btnProvision.innerHTML = '<i class="fa-solid fa-circle-check"></i> Number Registered & Active';
            btnProvision.classList.remove('btn-secondary');
            btnProvision.style.background = 'rgba(6, 182, 212, 0.15)';
            btnProvision.style.borderColor = '#06b6d4';
            btnProvision.style.color = '#06b6d4';
            btnProvision.disabled = true;

            // Unhide reserved number details badge
            numberDetails.classList.remove('hidden');
            phoneSenderName.innerText = `Hamilton Plumbing (${localNumber})`;

            // Unlock step 3 trigger button
            btnTrigger.disabled = false;
        }, 1500);
    });

    // --------------------------------------------------------
    // Step 3: Simulate Lead Submission (Automation Flow Trigger)
    // --------------------------------------------------------
    btnTrigger.addEventListener('click', async () => {
        // Disable trigger button temporarily to prevent overlapping animations
        btnTrigger.disabled = true;
        btnTrigger.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

        const nameVal = leadName.value.trim() || 'Lead';
        const serviceVal = leadService.value;
        const phoneVal = leadPhone.value.trim() || '+1 (416) 555-0182';
        const calendlyVal = inputCalendly.value.trim() || 'calendly.com';
        const templateBody = inputSMSBody.value;
        const isRealMode = toggleRealMode.checked;
        const webhookUrl = inputWebhook.value.trim();

        // Reset flow visual states
        resetVisualFlow();

        // Stage 1: Google Sheets Trigger
        engineStatus.innerText = `Triggering webhook: New lead detected in Sheets...`;
        nodeSheet.classList.add('active');
        statusSheet.innerText = 'Row Added';
        statusSheet.style.color = '#34a853';

        // Stage 2: Glow Path 1 Active (Particle flowing to engine)
        setTimeout(() => {
            path1.classList.add('active');
        }, 600);

        // Stage 3: SheetPulse Engine Active
        setTimeout(() => {
            engineStatus.innerText = `Parsing template: Greeting ${nameVal} for ${serviceVal} booking...`;
            nodeApp.classList.add('active');
            statusApp.innerText = isRealMode ? 'Forwarding Webhook' : 'Formatting SMS';
            statusApp.style.color = '#6366f1';
        }, 1600);

        // Stage 4: Glow Path 2 Active (Particle flowing to Twilio)
        setTimeout(() => {
            path2.classList.add('active');
        }, 2200);

        // Stage 5: Twilio / Real Webhook Call
        setTimeout(async () => {
            if (isRealMode && webhookUrl) {
                engineStatus.innerText = `Sending POST payload to Make.com Webhook...`;
                try {
                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: nameVal,
                            phone: phoneVal,
                            service: serviceVal,
                            calendly: calendlyVal,
                            smsTemplate: templateBody
                        })
                    });

                    if (response.ok) {
                        engineStatus.innerText = `Real SMS triggered successfully via Make.com!`;
                        nodeTwilio.classList.add('active');
                        statusTwilio.innerText = 'Sent (Live)';
                        statusTwilio.style.color = '#10b981';
                    } else {
                        engineStatus.innerText = `Webhook responded with error status: ${response.status}`;
                        statusTwilio.innerText = 'Failed';
                        statusTwilio.style.color = '#ef4444';
                    }
                } catch (error) {
                    console.error('Webhook error:', error);
                    engineStatus.innerText = `Network Error: Could not connect to Webhook URL.`;
                    statusTwilio.innerText = 'Net Error';
                    statusTwilio.style.color = '#ef4444';
                }
            } else {
                engineStatus.innerText = `SMS securely routed to ${phoneVal} via Twilio!`;
                nodeTwilio.classList.add('active');
                statusTwilio.innerText = 'Delivered';
                statusTwilio.style.color = '#f22f46';
            }
        }, 3200);

        // Stage 6: Smartphone Receives SMS (Vibration, Audio, and text display)
        setTimeout(() => {
            // Re-enable trigger button
            btnTrigger.disabled = false;
            btnTrigger.innerHTML = '<i class="fa-solid fa-play"></i> Submit Form & Trigger SMS';

            // Vibration & Ringer alert
            smartphone.classList.add('vibrate');
            playSMSNotificationSound();

            // Clear vibrate class after animation ends
            setTimeout(() => {
                smartphone.classList.remove('vibrate');
            }, 1500);

            // Construct and inject SMS Bubble
            let parsedSMS = templateBody
                .replace(/{Name}/g, nameVal)
                .replace(/{Service}/g, serviceVal)
                .replace(/{Calendly}/g, `<a href="https://${calendlyVal}" target="_blank" class="sms-link">${calendlyVal}</a>`);

            const smsBubble = document.createElement('div');
            smsBubble.className = 'sms-bubble';
            smsBubble.innerHTML = parsedSMS;

            // Remove default message helper text
            const sysMessage = phoneMessagesBody.querySelector('.system-message');
            if (sysMessage) sysMessage.remove();

            phoneMessagesBody.appendChild(smsBubble);
            
            // Auto scroll smartphone chat body to bottom
            phoneMessagesBody.scrollTop = phoneMessagesBody.scrollHeight;
        }, 3800);
    });

    // Helper: Reset Flow Canvas Visually
    function resetVisualFlow() {
        nodeSheet.classList.remove('active');
        nodeApp.classList.remove('active');
        nodeTwilio.classList.remove('active');
        path1.classList.remove('active');
        path2.classList.remove('active');
        statusSheet.innerText = 'Waiting';
        statusSheet.style.color = 'var(--text-muted)';
        statusApp.innerText = 'Idle';
        statusApp.style.color = 'var(--text-muted)';
        statusTwilio.innerText = 'Waiting';
        statusTwilio.style.color = 'var(--text-muted)';
    }

    // --------------------------------------------------------
    // Stripe Live Checkout Integration
    // --------------------------------------------------------
    const btnPayNow = document.getElementById('btn-pay-now');
    if (btnPayNow) {
        btnPayNow.addEventListener('click', () => {
            btnPayNow.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Redirecting to Secure Checkout...';
            btnPayNow.disabled = true;

            try {
                // Initialize Stripe with user's live Publishable Key
                const stripe = Stripe('pk_live_51R5wuGGP7DsRe5yNJbvwc2tLd4XoJMuEuNBAwkFePi5iESovsfcxCpUS4AVcXKMyrsjcSNSM25tFK1UGdoLCBCDv00KUx0oJVe');
                
                // Redirect to secure Stripe-hosted Checkout Session
                stripe.redirectToCheckout({
                    lineItems: [
                        { price: 'price_1Tb2GjGP7DsRe5yNp5sVDlbO', quantity: 1 }, // $99.99 CAD / month
                        { price: 'price_1Tb2ENGP7DsRe5yNx5CtxhIH', quantity: 1 }  // $499.99 CAD Setup Fee
                    ],
                    mode: 'subscription',
                    // Relative callbacks based on origin deployment (works for localhost, Vercel, and GitHub Pages)
                    successUrl: window.location.origin + '/success.html',
                    cancelUrl: window.location.origin + '/index.html'
                }).then((result) => {
                    if (result.error) {
                        btnPayNow.innerHTML = 'Pay Now';
                        btnPayNow.disabled = false;
                        alert(result.error.message);
                    }
                });
            } catch (error) {
                console.error('Stripe Configuration Error: ', error);
                btnPayNow.innerHTML = 'Pay Now';
                btnPayNow.disabled = false;
                alert('Stripe configuration error. Please ensure Client-Only Integration is enabled in your Stripe Dashboard settings.');
            }
        });
    }
});
