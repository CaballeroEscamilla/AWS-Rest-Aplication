import Profesor from "../Objetos/Profesor.js";

class Profesores {
    constructor() {
        this.profesores = [];
    }

    getProfesores() {
        return this.profesores;
    }

    addProfesor(profesor) {
        if (profesor instanceof Profesor) {
            this.profesores.push(profesor);
        } else {
            throw new Error('El objeto no es una instancia de Profesor');
        }
    }

    updateProfesor(id, updatedProfesor) {
        const index = this.profesores.findIndex(profesor => profesor.id === id);
        if (index !== -1) {
            if (updatedProfesor instanceof Profesor) {
                this.profesores[index] = updatedProfesor;
            } else {
                throw new Error('El objeto no es una instancia de Profesor');
            }
        } else {
            throw new Error('Profesor no encontrado');
        }
    }

    deleteProfesor(id) {
        this.profesores = this.profesores.filter(profesor => profesor.id !== id);
    }
}

export default Profesores;
