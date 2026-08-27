const CONFIG = {
  GOOGLE_SCRIPT_ID: 'AKfycbzZlY7YzNS7dA-lpLlMh02jz8C7ys2X9aM-Nz9ZHLD9BWpnFA2jnH1qeeqxPOXjJBNk'
};

const DOM = {
  subscribeForm: document.getElementById('subscribe'),
  dialog: document.getElementById('my-dialog'),
  dialogText: document.querySelector('#my-dialog p'),
  dialogClose: document.getElementById('close')
};

if (DOM.subscribeForm) {
  DOM.dialogClose?.addEventListener('click', () => DOM.dialog?.close());

  DOM.subscribeForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bodyData = new URLSearchParams(formData.entries());
    const formElements = Array.from(DOM.subscribeForm.elements);

    formElements.forEach(el => el.style.display = 'none');
    DOM.subscribeForm.classList.add('loader');

    try {
      const response = await fetch(`https://script.google.com/macros/s/${CONFIG.GOOGLE_SCRIPT_ID}/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyData
      });

      if (!response.ok) {
        throw new Error(`Status HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 200) {
        DOM.dialogText.innerText = 'E-mail cadastrado com sucesso!';
        DOM.subscribeForm.reset();
      } else {
        throw new Error(`Status HTTP: ${result.status}`);
      }
    } catch (error) {
      DOM.dialogText.innerText = `Erro ao cadastrar o e-mail!\n\n${error.message || error}`;
    } finally {
      DOM.dialog?.showModal();
      DOM.subscribeForm.classList.remove('loader');
      formElements.forEach(el => el.style.display = 'inline');
    }
  };
}
