const API_URL = 'https://iit-playground.arondev.hu';
const NEPTUN_CODE = 'ZGEKAJ';

// DOM Elements
const carGrid = document.getElementById('carGrid');
const carModal = document.getElementById('carModal');
const carForm = document.getElementById('carForm');
const formError = document.getElementById('formError');
const addCarBtn = document.getElementById('addCarBtn');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadCars);
addCarBtn.addEventListener('click', () => openModal());
carForm.addEventListener('submit', handleFormSubmit);

// Functions
async function loadCars() {
    try {
        const response = await fetch(`${API_URL}/api/${NEPTUN_CODE}/car`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Hiba történt az autók betöltése során');
        }
        
        const cars = await response.json();
        displayCars(cars);
    } catch (error) {
        showError('Hiba történt az autók betöltése során. Kérjük próbálja újra később.');
    }
}

function displayCars(cars) {
    carGrid.innerHTML = '';
    cars.forEach(car => {
        const carCard = createCarCard(car);
        carGrid.appendChild(carCard);
    });
}

function createCarCard(car) {
    const card = document.createElement('div');
    card.className = `car-card ${car.electric ? 'featured' : ''}`;
    card.innerHTML = `
        <h3>${car.brand} ${car.model}</h3>
        <p>Tulajdonos: ${car.owner}</p>
        <p>Üzemanyagfogyasztás: ${car.fuelUse} l/100km</p>
        <p>Gyártás dátuma: ${car.dayOfCommission}</p>
        <p>${car.electric ? 'Elektromos' : 'Benzines/Dízel'}</p>
        <div class="card-actions">
            <button class="btn btn-primary" onclick="editCar(${car.id})">Szerkesztés</button>
            <button class="btn btn-danger" onclick="deleteCar(${car.id})">Törlés</button>
        </div>
    `;
    return card;
}

function openModal(car = null) {
    carModal.style.display = 'block';
    if (car) {
        document.getElementById('formTitle').textContent = 'Edit Car';
        fillFormWithCarData(car);
    } else {
        document.getElementById('formTitle').textContent = 'New Car';
        carForm.reset();
    }
}

function closeModal() {
    carModal.style.display = 'none';
    carForm.reset();
    formError.style.display = 'none';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        owner: document.getElementById('owner').value,
        fuelUse: parseFloat(document.getElementById('fuelUse').value),
        dayOfCommission: document.getElementById('dayOfCommission').value,
        electric: document.getElementById('electric').value === 'true'
    };

    try {
        const carId = carForm.dataset.carId;
        const url = `${API_URL}/api/${NEPTUN_CODE}/car`;
        const method = carId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carId ? { ...formData, id: carId } : formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Hiba történt az autó mentése során');
        }

        closeModal();
        loadCars();
    } catch (error) {
        showError(error.message);
    }
}

async function deleteCar(id) {
    if (!confirm('Biztosan törölni szeretné ezt az autót?')) return;

    try {
        const response = await fetch(`${API_URL}/api/${NEPTUN_CODE}/car/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Hiba történt az autó törlése során');
        }

        loadCars();
    } catch (error) {
        showError('Hiba történt az autó törlése során. Kérjük próbálja újra.');
    }
}

async function editCar(id) {
    try {
        const response = await fetch(`${API_URL}/api/${NEPTUN_CODE}/car/${id}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Hiba történt az autó adatainak betöltése során');
        }
        
        const car = await response.json();
        carForm.dataset.carId = id;
        openModal(car);
    } catch (error) {
        showError('Hiba történt az autó adatainak betöltése során. Kérjük próbálja újra.');
    }
}

function fillFormWithCarData(car) {
    document.getElementById('brand').value = car.brand;
    document.getElementById('model').value = car.model;
    document.getElementById('owner').value = car.owner;
    document.getElementById('fuelUse').value = car.fuelUse;
    document.getElementById('dayOfCommission').value = car.dayOfCommission;
    document.getElementById('electric').value = car.electric.toString();
}

function showError(message) {
    formError.textContent = message;
    formError.style.display = 'block';
    setTimeout(() => {
        formError.style.display = 'none';
    }, 3000);
}