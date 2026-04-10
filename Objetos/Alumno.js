class Alumno {
    constructor(id, nombres, apellidos, matricula, promedio) {
        this.id = id;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.matricula = matricula;
        this.promedio = promedio;
    }

    getId() {
        return this.id;
    }

    getNombres() {
        return this.nombres;
    }

    getApellidos() {
        return this.apellidos;
    }

    getMatricula() {
        return this.matricula;
    }

    getPromedio() {
        return this.promedio;
    }

    setNombres(nombres) {
        this.nombres = nombres;
    }

    setApellidos(apellidos) {
        this.apellidos = apellidos;
    }

    setMatricula(matricula) {
        this.matricula = matricula;
    }

    setPromedio(promedio) {
        this.promedio = promedio;
    }
}

export default Alumno;