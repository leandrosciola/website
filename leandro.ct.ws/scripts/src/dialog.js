const DOM = {
  dialog: document.querySelector('dialog'),
  dialogDiv: document.querySelector('dialog div'),
  dialogButton: document.querySelector('dialog button')
};

if (DOM.dialog) {
  DOM.dialogButton?.addEventListener('click', () => DOM.dialog?.close());
}

window.dialog = (data, classes = []) => {
  DOM.dialog.className = '';
  if (Array.isArray(classes) && classes.length > 0) {
    DOM.dialog?.classList.add(...classes);
  }
  DOM.dialogDiv.innerHTML = data;
  DOM.dialog?.showModal();
};
