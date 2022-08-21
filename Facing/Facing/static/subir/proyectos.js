const wrapper = document.querySelector(".wrapper");
    const fileName = document.querySelector(".file-name");
    const defaultBtn = document.querySelector("#default-btn");
    const customBtn = document.querySelector("#custom-btn");
    const cancelBtn = document.querySelector("#cancel-btn i");
    const vid = document.getElementById("video");
    const sub = document.getElementById("subir");
    let regExp = /[0-9a-zA-Z\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_ ]+$/;

    function defaultBtnActive() {
        defaultBtn.click();
    }
    defaultBtn.addEventListener("change", function() {
        const file = this.files[0];
        let fileType = file.type;
        let validExtensions = ["video/mp4", "video/webm"];
        if (validExtensions.includes(fileType)) {
            const reader = new FileReader();
            reader.onload = function() {
                const result = reader.result;
                vid.src = result;
                wrapper.classList.add("active");
                vid.classList.remove('d-none');
                customBtn.classList.add('d-none');
                sub.classList.remove('d-none');
            }
            cancelBtn.addEventListener("click", function() {
                vid.src = "";
                wrapper.classList.remove("active");
                vid.classList.add('d-none');
                customBtn.classList.remove('d-none');
                sub.classList.add('d-none');
            })
            reader.readAsDataURL(file);
        }else{
            alert("El archivo no es del formato correcto (Video mp4 o webm).");
        }
        if (this.value) {
            let valueStore = this.value.match(regExp);
            fileName.textContent = valueStore;
        }
    });
