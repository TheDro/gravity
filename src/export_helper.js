import json5 from 'json5'

function copyToClipboard(str) {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function setUrlParam(key, value) {
  let url = new URL(window.location.href)

  if (value === null || value === undefined) {
    url.searchParams.delete(key)
  } else if (typeof value === 'string') {
    let stringValue = value
    url.searchParams.set(key, stringValue)
  } else {
    let stringValue = json5.stringify(value)
    url.searchParams.set(key, stringValue)
  }

  window.history.replaceState(null, null, url)
}

function getUrlParam(key) {
  let url = new URL(window.location.href)
  let searchParam = url.searchParams.get(key)
  if (searchParam === null) {
    return null
  } else if ( searchParam.length > 1 && (searchParam[0] === '{' || searchParam[0] === '[') ) {
    try {
      return json5.parse(searchParam)
    } catch {
      return null
    }
  } else {
    return searchParam
  }
}

export {copyToClipboard, getUrlParam, setUrlParam}