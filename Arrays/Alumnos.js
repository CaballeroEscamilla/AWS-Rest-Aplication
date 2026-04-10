import Alumno from '../Objetos/Alumno.js';

class Alumnos {
    constructor() {
        this.alumnos = [];
    }

    getAlumnos() {
        return this.alumnos;
    }

    addAlumno(alumno) {
        if (alumno instanceof Alumno) {
            this.alumnos.push(alumno);
        } else {
            throw new Error('El objeto no es una instancia de Alumno');
        }  
    }

    updateAlumno(id, updatedAlumno) {
        const index = this.alumnos.findIndex(alumno => alumno.id === id);
        if (index !== -1) {
            if (updatedAlumno instanceof Alumno) {
                this.alumnos[index] = updatedAlumno;
            } else {
                throw new Error('El objeto no es una instancia de Alumno');
            }
        } else {
            throw new Error('Alumno no encontrado');
        }
    }

    deleteAlumno(id) {
        this.alumnos = this.alumnos.filter(alumno => alumno.id !== id);
    }


}

export default Alumnos;