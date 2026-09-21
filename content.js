(function() {
    'use strict';

    // User Configuration
    const fieldsToCopy = [
        "Phone",
        "Email",
        "Case Number",
        "Vehicle Model",
        "Dealer Code",
        "Account Name",
        "Mailing Address",
        "Registration Number",
        "Warranty Start Date",
        "Warranty End Date",
        "VIN",
        "Amount Offered", //not working for voucher fields 
        "Expense Code"
    ];

    /**
     * Extracts only the field value, ignoring edit buttons and hidden assistive text.
     */
    const handleCopy = (event) => {
        const button = event.currentTarget;
        const container = button.closest('.slds-form-element__control');
        
        if (!container) return;

        // Specifically target the value span
        const valueSpan = container.querySelector('.test-id__field-value');
        
        let textToCopy = '';
        if (valueSpan) {
            // Fix: Clone the element to manipulate it without affecting the UI
            const clone = valueSpan.cloneNode(true);
            
            // Fix: Remove all assistive text (like "Preview") and nested buttons
            const unwanted = clone.querySelectorAll('.slds-assistive-text, button, .slds-button');
            unwanted.forEach(el => el.remove());
            
            // Get the clean text
            textToCopy = clone.innerText.trim();
        } else {
            // Fallback: cleaning up container text if standard span isn't found
            // We still want to avoid copying the icon and the extension's own button text
            const clone = container.cloneNode(true);
            const unwanted = clone.querySelectorAll('.copy-btn, .slds-assistive-text, button');
            unwanted.forEach(el => el.remove());
            textToCopy = clone.innerText.trim();
        }

        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalTitle = button.title;
                const originalText = button.innerText;
                button.title = 'Copied!';
                button.innerText = '✅';
                setTimeout(() => {
                    button.title = originalTitle;
                    button.innerText = originalText;
                }, 1000);
            });
        }
    };

    /**
     * Checks if a field should have a copy button based on the configuration.
     */
    const shouldAddButton = (element) => {
        const formElement = element.closest('.slds-form-element');
        if (!formElement) return false;
        
        const label = formElement.querySelector('.test-id__field-label');
        if (!label) return false;

        const labelText = label.innerText.trim();
        return fieldsToCopy.some(field => labelText.toLowerCase() === field.toLowerCase());
    };

    /**
     * Injects the copy button into qualified Salesforce fields.
     */
    const injectButtons = () => {
        const controls = document.querySelectorAll('.slds-form-element__control:not([data-has-copy-btn="true"])');

        controls.forEach(control => {
            if (shouldAddButton(control)) {
                control.setAttribute('data-has-copy-btn', 'true');
                
                control.style.display = 'flex';
                control.style.alignItems = 'center';

                const btn = document.createElement('button');
                btn.className = 'copy-btn slds-button slds-button_icon';
                btn.innerText = '📋';
                
                const label = control.closest('.slds-form-element').querySelector('.test-id__field-label');
                btn.title = `Copy ${label ? label.innerText : 'Field'}`;

                Object.assign(btn.style, {
                    marginLeft: '6px',
                    cursor: 'pointer',
                    border: '1px solid transparent',
                    borderRadius: '0.25rem',
                    padding: '0px 4px',
                    background: 'white',
                    fontSize: '13px',
                    lineHeight: '1',
                    flexShrink: '0'
                });

                btn.addEventListener('click', handleCopy);
                control.appendChild(btn);
            }
        });
    };

    const observer = new MutationObserver(() => injectButtons());
    observer.observe(document.body, { childList: true, subtree: true });

    injectButtons();
})();