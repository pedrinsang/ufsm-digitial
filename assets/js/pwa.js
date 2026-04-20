(function () {
    function isStandalone() {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true
        );
    }

    function isIOS() {
        return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    }

    function canRegisterServiceWorker() {
        return (
            'serviceWorker' in navigator &&
            (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1')
        );
    }

    function registerServiceWorker() {
        if (!canRegisterServiceWorker()) {
            return;
        }

        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        });
    }

    function setupInstallButton() {
        const fab = document.getElementById('primary-fab');
        if (!fab) {
            return;
        }

        const icon = document.getElementById('primary-fab-icon');
        const label = document.getElementById('primary-fab-label');
        const iosModal = document.getElementById('ios-install-modal');
        const iosClose = document.getElementById('ios-install-close');
        let deferredPrompt = null;

        function setWalletMode() {
            fab.dataset.mode = 'wallet';
            fab.classList.remove('rounded-full', 'px-4', 'w-auto', 'gap-2');
            fab.classList.add('w-14', 'h-14', 'rounded-[16px]');
            icon.className = 'fa-regular fa-id-card text-[25px] text-[#003b5c]';
            label.classList.add('hidden');
            label.textContent = '';
            fab.setAttribute('aria-label', 'Abrir carteira');
        }

        function setInstallMode() {
            fab.dataset.mode = 'install';
            fab.classList.remove('w-14', 'h-14', 'rounded-[16px]');
            fab.classList.add('rounded-full', 'px-4', 'w-auto', 'gap-2');
            icon.className = 'fa-solid fa-download text-[18px] text-[#003b5c]';
            label.classList.remove('hidden');
            label.textContent = 'Instalar';
            fab.setAttribute('aria-label', 'Instalar aplicativo');
        }

        function closeIosModal() {
            if (iosModal) {
                iosModal.classList.add('hidden');
            }
        }

        function openIosModal() {
            if (iosModal) {
                iosModal.classList.remove('hidden');
            }
        }

        async function handleInstallClick() {
            if (fab.dataset.mode === 'wallet') {
                window.location.href = 'carteira.html';
                return;
            }

            if (isIOS() && !isStandalone()) {
                openIosModal();
                return;
            }

            if (!deferredPrompt) {
                return;
            }

            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;

            if (choice.outcome === 'accepted') {
                setWalletMode();
            } else {
                setInstallMode();
            }

            deferredPrompt = null;
        }

        fab.addEventListener('click', handleInstallClick);

        if (iosClose) {
            iosClose.addEventListener('click', closeIosModal);
        }

        if (iosModal) {
            iosModal.addEventListener('click', (event) => {
                if (event.target === iosModal) {
                    closeIosModal();
                }
            });
        }

        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            deferredPrompt = event;

            if (!isStandalone()) {
                setInstallMode();
            }
        });

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            closeIosModal();
            setWalletMode();
        });

        if (isStandalone()) {
            setWalletMode();
            return;
        }

        if (isIOS()) {
            setInstallMode();
            return;
        }

        setWalletMode();
    }

    registerServiceWorker();

    document.addEventListener('DOMContentLoaded', () => {
        setupInstallButton();
    });
})();
