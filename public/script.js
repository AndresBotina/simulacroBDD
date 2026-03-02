// LÓGICA DEL FRONTEND (PASO 2: FUNCIONES JAVASCRIPT)
// este archivo maneja las peticiones a la API del servidor

const API_URL = '/api/doctors'; // url base para los doctores

/**
 * FUNCIONAMIENTO: Obtiene la lista de doctores del servidor.
 * PASO A: Llama a GET /api/doctors.
 * PASO B: Limpia la lista actual en el HTML y dibuja los nuevos datos.
 */
async function getDoctors() {
    try {
        const response = await fetch(API_URL);
        const doctors = await response.json();

        const list = document.getElementById('doctors-list');
        list.innerHTML = ''; // limpia la lista

        doctors.forEach(doctor => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${doctor.name}</strong> - ${doctor.specialty} (${doctor.email})
                <button onclick="deleteDoctor(${doctor.id})">Eliminar</button>
                <button onclick="prepareUpdate(${doctor.id}, '${doctor.name}', '${doctor.specialty}')">Editar</button>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        console.error('Error al obtener doctores:', error);
    }
}

/**
 * FUNCIONAMIENTO: Envía los datos de un nuevo doctor al servidor.
 * PASO A: Captura los valores de los inputs.
 * PASO B: Envía una petición POST con el JSON al servidor.
 */
async function createDoctor() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const specialty = document.getElementById('specialty').value;

    if (!name || !email || !specialty) {
        alert('Por favor llena todos los campos');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, specialty })
        });

        const resData = await response.json();
        alert(resData.message);

        getDoctors(); // recarga la lista para ver el cambio
    } catch (error) {
        console.error('Error al crear doctor:', error);
    }
}

/**
 * FUNCIONAMIENTO: Elimina un doctor por su ID.
 * PASO A: Envía una petición DELETE al servidor.
 */
async function deleteDoctor(id) {
    if (!confirm('¿Estás seguro de eliminar este doctor?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const resData = await response.json();
        alert(resData.message);
        getDoctors(); // recarga la lista
    } catch (error) {
        console.error('Error al eliminar doctor:', error);
    }
}

/**
 * FUNCIONAMIENTO: Simula la preparación para actualizar.
 * En este frontend simple, usamos un prompt para pedir el nuevo nombre.
 */
async function prepareUpdate(id, oldName, oldSpecialty) {
    const newName = prompt('Nuevo nombre del doctor:', oldName);
    const newSpecialty = prompt('Nueva especialidad:', oldSpecialty);

    if (newName && newSpecialty) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, specialty: newSpecialty })
            });
            const resData = await response.json();
            alert(resData.message);
            getDoctors();
        } catch (error) {
            console.error('Error al actualizar doctor:', error);
        }
    }
}

// AL CARGAR LA PÁGINA, BUSCAMOS LOS DOCTORES AUTOMÁTICAMENTE
getDoctors();
