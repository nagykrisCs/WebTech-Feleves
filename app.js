const API_URL = "http://localhost:3000/cars";
const carForm = document.getElementById("car-form");
const statusBox = document.getElementById("status-message");

// --- 1. LISTÁZÁS (READ) ---
async function getCars() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Szerver hiba a lekérésnél");
        const cars = await response.json();
        renderCars(cars);
    } catch (error) {
        showStatus("HIBA: Nem sikerült betölteni az autókat!", "error");
    }
}

function renderCars(cars) {
    const list = document.getElementById("car-list");
    list.innerHTML = "";
    
    cars.forEach(car => {
        // Ellenőrizzük, hogy van-e ID, ha nincs, a JSON-server nem mentette el jól
        if (!car.id) return;

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${car.brand} ${car.model}</h3>
            <p><strong>Évjárat:</strong> ${car.year}</p>
            <p><strong>Fogyasztás:</strong> ${car.consumption} L/100km</p>
            <div class="card-buttons">
                <button class="btn-edit" onclick="editCar('${car.id}')">Szerkesztés</button>
                <button class="btn-del" onclick="deleteCar('${car.id}')">Törlés</button>
            </div>
        `;
        list.appendChild(card);
    });
}

// --- 2. MENTÉS / MÓDOSÍTÁS (CREATE / UPDATE) ---
carForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("car-id").value;
    const carData = {
        brand: document.getElementById("brand").value.trim(),
        model: document.getElementById("model").value.trim(),
        year: parseInt(document.getElementById("year").value),
        consumption: parseFloat(document.getElementById("consumption").value)
    };

    // Validáció
    if (carData.year < 1886 || carData.year > 2027) {
        return showStatus("HIBA: Érvénytelen évszám!", "error");
    }

    try {
        const method = id ? "PUT" : "POST";
        const url = id ? `${API_URL}/${id}` : API_URL;

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(carData)
        });

        if (!res.ok) throw new Error("Sikertelen mentés");

        // FONTOS: Megvárjuk, amíg a szerver végez, és CSAK utána töltjük újra
        await res.json(); 
        await getCars(); 
        
        showStatus("Sikeres mentés!", "success");
        resetForm();
    } catch (error) {
        showStatus("SZERVER HIBA: Nem sikerült menteni!", "error");
    }
});

// --- 3. TÖRLÉS (DELETE) ---
async function deleteCar(id) {
    // Debug: kiírjuk a konzolra, mit akarunk törölni (F12-nél látod)
    console.log("Törlés indítása ID-val:", id);

    if (!id || id === 'undefined') {
        showStatus("Hiba: Ennek az autónak nincs azonosítója!", "error");
        return;
    }
    
    if (!confirm("Biztosan törlöd?")) return;
    
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        
        if (!res.ok) throw new Error("Sikertelen törlés");
        
        await getCars(); // Lista frissítése
        showStatus("Autó sikeresen törölve.", "success");
    } catch (error) {
        console.error("Törlési hiba:", error);
        showStatus("SZERVER HIBA: Nem sikerült a törlés!", "error");
    }
}

// --- SEGÉDFÜGGVÉNYEK ---
async function editCar(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const car = await res.json();
        
        document.getElementById("car-id").value = car.id;
        document.getElementById("brand").value = car.brand;
        document.getElementById("model").value = car.model;
        document.getElementById("year").value = car.year;
        document.getElementById("consumption").value = car.consumption;
        
        document.getElementById("form-title").innerText = "Autó módosítása";
        document.getElementById("form-btn").innerText = "Módosítás mentése";
        document.getElementById("cancel-btn").classList.remove("hidden");
    } catch (error) {
        showStatus("Hiba az adatok betöltésekor!", "error");
    }
}

function resetForm() {
    carForm.reset();
    document.getElementById("car-id").value = "";
    document.getElementById("form-title").innerText = "Új autó rögzítése";
    document.getElementById("form-btn").innerText = "Mentés az adatbázisba";
    document.getElementById("cancel-btn").classList.add("hidden");
}

function showStatus(text, type) {
    statusBox.innerText = text;
    statusBox.className = `status-box ${type}`;
    setTimeout(() => { statusBox.className = "status-box hidden"; }, 4000);
}

document.getElementById("cancel-btn").addEventListener("click", resetForm);

getCars();