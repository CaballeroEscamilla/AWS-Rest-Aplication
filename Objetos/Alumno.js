class Alumno {
    constructor(id, nombres, apellidos, matricula, promedio, password, fotoPerfilUrl = null) {
        this.id = id;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.matricula = matricula;
        this.promedio = promedio;
        this.password = password;
        this.fotoPerfilUrl = fotoPerfilUrl;
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

    getPassword() {
        return this.password;
    }

    getFotoPerfilUrl() {
        return this.fotoPerfilUrl;
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

    setPassword(password) {
        this.password = password;
    }

    setFotoPerfilUrl(fotoPerfilUrl) {
        this.fotoPerfilUrl = fotoPerfilUrl;
    }
}

export default Alumno;