// Pastoral Care - Hover Effect schema
functionSchema = {
  functionName: 'Hover Effect',
  description: 'Shows an image when hovering over the category field in pastoral care.',
  fields: [
    {
      name: 'imageID',
      label: 'Image ID',
      type: 'input',
      placeholder: 'Resource image ID from Schoolbox',
      default: '10690',
      tips: 'Find the ID in the image URL after send.php?id='
      ,
      allowMultiple: false
    },
    {
      name: 'imageHeight',
      label: 'Image Height (px)',
      type: 'input',
      placeholder: 'e.g. 300',
      default: '300'
      ,
      allowMultiple: false
    },
    {
      name: 'imageWidth',
      label: 'Image Width (px)',
      type: 'input',
      placeholder: 'e.g. 400',
      default: '300'
      ,
      allowMultiple: false
    }
  ],
  options: []
};

// -------- Function code below --------

// Inject runtime variables from schema
;(function(){
  const s = typeof functionSchema !== 'undefined' ? functionSchema : {};
  function getField(name){
    return Array.isArray(s.fields) ? s.fields.find(f=>f.name===name) : null;
  }
  const idF = getField('imageID');
  const hF = getField('imageHeight');
  const wF = getField('imageWidth');
  window.hoverEffect_imageID = (idF && (idF.default || idF.placeholder)) || '';
  window.hoverEffect_imageHeight = (hF && (hF.default || hF.placeholder)) || '';
  window.hoverEffect_imageWidth = (wF && (wF.default || wF.placeholder)) || '';
})();
// The runtime behaviour for the hover image is appended below.
(function() {
  function attach() {
    const dropdownMenu = document.getElementById('severityId');
    if (!dropdownMenu) return;
    const hoverImage = document.createElement('img');
    hoverImage.id = 'hoverImage';
    hoverImage.src = `${schoolboxDomain}/send.php?id=${hoverEffect_imageID}&height=${hoverEffect_imageHeight}&width=${hoverEffect_imageWidth}`;
    hoverImage.alt = 'Hover Image';
    hoverImage.style.display = 'none';
    hoverImage.style.position = 'absolute';
    hoverImage.style.height = '35REM';
    hoverImage.style.zIndex = '1000';
    document.body.appendChild(hoverImage);

    dropdownMenu.addEventListener('mouseover', () => {
      const rect = dropdownMenu.getBoundingClientRect();
      hoverImage.style.top = `${rect.top + window.scrollY}px`;
      hoverImage.style.left = `${rect.right + window.scrollX}px`;
      hoverImage.style.transform = 'translateY(-50%)';
      hoverImage.style.display = 'block';
    });

    dropdownMenu.addEventListener('mouseout', () => {
      hoverImage.style.display = 'none';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach); else attach();
})();
