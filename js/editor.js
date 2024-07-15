// load monaco-editor config
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
  // init monaco-editor
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'markdown'
  });

  editor.getModel().onDidChangeContent(debounce(() => {
    const content = editor.getValue();
    resetPreview();
    setDlBtnDisabled(true);

    if (content) {
      convert(content);
    }
  }, 1000));

  // init event listner
  const downloadBtn = document.getElementById('download-btn');
  downloadBtn.addEventListener('click', (_) => {
    convert(editor.getValue(), getDownloadFormatValue(), true);
  });
});

// functions
async function post(umlText, format, download) {
  try {
    const res = await fetch('/converter.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ umlText, format, download }),
    });

    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error('Error:', error);
  };
}

async function convert(umlText, format = 'png', download = false) {
  const resData = await post(umlText, format, download);
  const previewEl = document.getElementById('preview-img-wrapper');

  if (resData.success) {
    setDlBtnDisabled(false);

    if (download) {
      const base64ImageData = resData.image;
      const blob = base64toBlob(base64ImageData);
      const imageUrl = URL.createObjectURL(blob);
      downloadImage(imageUrl, format);
    } else {
      const img = createPreviewImageEl(resData.image);
      previewEl.appendChild(img);
    }
  } else {
    const p = createErrorTextEl();
    previewEl.appendChild(p);
  }
}

function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  }
}

function base64toBlob(base64Data) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray]);
}

function getDownloadFormatValue() {
  const selectBox = document.getElementById('format');
  return selectBox.value;
}

function setDlBtnDisabled(disabled) {
  const button = document.getElementById('download-btn');
  button.disabled = disabled;
}

function downloadImage(imageUrl, format) {
  const a = document.createElement('a');
  a.href = imageUrl;
  a.download = `image.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function createPreviewImageEl(imageSrc) {
  const img = document.createElement('img');
  img.src = imageSrc;
  img.style.objectFit = 'contain';
  return img;
}

function createErrorTextEl() {
  const p = document.createElement('p');
  p.innerText = 'Error!';
  p.style.color = 'red';
  return p;
}

function resetPreview() {
  const previewEl = document.getElementById('preview-img-wrapper');
  previewEl.innerHTML = '';
}
