const dropdownMenu = document.getElementById('severityId');
const hoverImage = document.createElement('img');
hoverImage.id = 'hoverImage';
hoverImage.src = `https://${schoolboxDomain}/send.php?id=${hoverEffect_imageID}&height=${hoverEffect_imageHeight}&width=${hoverEffect_imageWidth}`;
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
