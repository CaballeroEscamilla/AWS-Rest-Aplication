class Profesor {
    constructor(id, numeroEmpleado, nombres, apellidos, horasClase) {
        this.id = id;
        this.numeroEmpleado = numeroEmpleado;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.horasClase = horasClase;
    }

    getId() {
        return this.id;
    }

    getNumeroEmpleado() {
        return this.numeroEmpleado;
    }

    getNombres() {
        return this.nombres;
    }

    getApellidos() {
        return this.apellidos;
    }

    getHorasClase() {
        return this.horasClase;
    }

    setNumeroEmpleado(numeroEmpleado) {
        this.numeroEmpleado = numeroEmpleado;
    }

    setNombres(nombres) {
        this.nombres = nombres;
    }

    setApellidos(apellidos) {
        this.apellidos = apellidos;
    }

    setHorasClase(horasClase) {
        this.horasClase = horasClase;
    }

}

export default Profesor;