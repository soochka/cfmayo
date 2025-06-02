const map = L.map('map').setView([32.109333, 34.855499], 13);

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    attribution: '© Google'
});

const customIcon = L.icon({
    iconUrl: 'images/nuni.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

let memoryMarkers = [];

const memories = [
    { lat: 32.085305, lon: 34.794392, type: 'image', src: 'media/clay.jpg', title: 'קליי האוס תל אביב', mode: 'osm' },
    { lat: 32.323604, lon: 34.932866, type: 'image', src: 'media/pakan.jpg', title: 'הפקאן 15 כפר יונה', mode: 'osm' },
    { lat: 32.312322541313485, lon: 34.943794094558875, type: 'image', src: 'media/hayadidut.jpg', title: 'הידידות 19 כפר יונה', mode: 'satellite' },
    { lat: 32.31425, lon: 34.92038, type: 'image', src: 'media/nahal-kama.jpg', title: 'נחל קמה 28 כפר יונה', mode: 'osm' },
    { lat: 32.335678, lon: 34.851561, type: 'image', src: 'media/nitza.jpg', title: 'שדרות ניצה נתניה', mode: 'osm' },
    { lat: 48.8750, lon: 2.3530, type: 'image', src: 'media/paris-train.jpg', title: 'רכבת בפריז', mode: 'satellite' },
    { lat: 48.870502, lon: 2.304897, type: 'image', src: 'media/champs.jpg', title: 'שאנז אליזה', mode: 'satellite' },
    { lat: 48.867374, lon: 2.784018, type: 'video', src: 'media/video.mp4', title: 'יורודיסני פריז', mode: 'satellite' },
    { lat: 32.166313, lon: 34.843311, type: 'image', src: 'media/pascal.jpg', title: 'פסקל הרצליה', mode: 'satellite' }
];

// פונקציות עזר
function toRad(value) {
    return value * Math.PI / 180;
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // רדיוס כדור הארץ בק"מ
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// מחיקת כל המרקרים הקיימים
function clearMemoryMarkers() {
    memoryMarkers.forEach(marker => map.removeLayer(marker));
    memoryMarkers = [];
}

// הוספת זיכרונות בהתאם למוד
function addMemoryMarkers(mode) {
    clearMemoryMarkers();

    if (mode === 'osm') {
        // מוד רגיל - מציג את כל הזיכרונות עם mode 'osm'
        memories.filter(m => m.mode === 'osm').forEach(memory => {
            const marker = L.marker([memory.lat, memory.lon], { icon: customIcon }).addTo(map);
            let popupContent = `<h3>${memory.title}</h3>`;
            if (memory.type === 'image') {
                popupContent += `<img src="${memory.src}" width="200" alt="${memory.title}">`;
            } else if (memory.type === 'video') {
                popupContent += `<video controls width="200"><source src="${memory.src}" type="video/mp4"></video>`;
            }
            marker.bindPopup(popupContent);
            memoryMarkers.push(marker);
        });
    } else if (mode === 'satellite') {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                // שנה צבע של אייקון המיקום
                locationIcon.style.color = 'yellow';
    
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
    
                memories.filter(m => m.mode === 'satellite').forEach(memory => {
                    const marker = L.marker([memory.lat, memory.lon], { icon: customIcon }).addTo(map);
                    const distance = getDistance(userLat, userLon, memory.lat, memory.lon);
    
                    let popupContent;
                    if (distance <= 1) {
                        popupContent = `<h3>${memory.title}</h3>`;
                        if (memory.type === 'image') {
                            popupContent += `<img src="${memory.src}" width="200" alt="${memory.title}">`;
                        } else if (memory.type === 'video') {
                            popupContent += `<video controls width="200"><source src="${memory.src}" type="video/mp4"></video>`;
                        }
                    } else {
                        popupContent = `<b>אתה רחוק מדי מהמיקום כדי לצפות בזיכרון הזה 📍</b>`;
                    }
    
                    marker.bindPopup(popupContent);
                    memoryMarkers.push(marker);
                });
            }, () => {
                alert("לא ניתן לגשת למיקום שלך ולכן לא ניתן להציג את הזיכרונות במבצע מוביץ.");
                locationIcon.style.color = 'red';
            });
        } else {
            alert("הדפדפן שלך לא תומך במיקום גיאוגרפי.");
            locationIcon.style.color = 'red';
        }
    }
}    

// טיפול בשינוי מצב מפה
document.getElementById('mapMode').addEventListener('change', e => {
    const mode = e.target.value;
    if (mode === 'osm') {
        map.removeLayer(satellite);
        map.addLayer(osm);
    } else if (mode === 'satellite') {
        map.removeLayer(osm);
        map.addLayer(satellite);
    }
    addMemoryMarkers(mode);
});

// תאריך ושעה בטופבר
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('datetime').textContent = now.toLocaleDateString('he-IL', options);
}
setInterval(updateDateTime, 60000);
updateDateTime();

// כפתור מיקום – סימון צבע בהתאם לאפשרות זמין/לא זמין
const locationIcon = document.getElementById('locationIcon');


// הוספת מיקום חדש
function toggleAddLocation() {
    const form = document.getElementById('form-container');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveLocation() {
    const title = document.getElementById('title').value.trim();
    const image = document.getElementById('image').value.trim();
    const lat = parseFloat(document.getElementById('lat').value);
    const lon = parseFloat(document.getElementById('lon').value);
    const mode = document.getElementById('mapMode').value;

    if (!title || !image || isNaN(lat) || isNaN(lon)) {
        alert('אנא מלא את כל השדות כראוי.');
        return;
    }

    const newMemory = {
        lat,
        lon,
        type: 'image',
        src: image,
        title,
        mode
    };

    memories.push(newMemory);
    localStorage.setItem('memories', JSON.stringify(memories));

    alert('המיקום נשמר!');
    toggleAddLocation();
    addMemoryMarkers(mode);
}

window.onload = () => {
    const savedMemories = localStorage.getItem('memories');
    if (savedMemories) {
        const parsed = JSON.parse(savedMemories);
        if (Array.isArray(parsed)) memories.push(...parsed);
    }
    addMemoryMarkers('osm');
};
