// Espero a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.entregado-btn');

  // Selecciona todos los botones. tiene que ser con class ya que id aquí no serviría.
  buttons.forEach(button => {
    button.addEventListener('click', function () {    //no usamos función flecha para poder usar .this en cada botón. si lo usara con flecha se referiría al contexto 
      const spinnerContainer = document.querySelector('.spinner-container');
      spinnerContainer.classList.remove('escondido') // Muestra el Spinner

      const id = this.dataset.id;
      const url = `/entregado/${id}`;

      fetch(url, {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json' //no hace falta ya que enviamos el dato por la url
        // }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error en la solicitud');
          }
          return response.json();
        })
        .then(data => {
          //console.log('entregado:', data);
          //location.reload()  //esto funcionaba bien, pero ahora lo puedo hacer sin recargar!!! podría hacerlo en las otras solicitudes!
          // Actualizar el estado del botón según la respuesta:
          if (data.entregado) {     //ahora el servidor contesta con el estado de entregado!
            this.querySelector('span').textContent = '✅';
          } else {
            this.querySelector('span').textContent = '⚪';
          }
          spinnerContainer.classList.add('escondido'); // Ocultar el spinner
        })
        .catch(error => {
          console.error('Error:', error);
          spinnerContainer.classList.add('escondido'); // Ocultar el spinner en caso de error
        });
    });
  });
});