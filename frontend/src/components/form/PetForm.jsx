import React from "react";
import { useState } from "react";
import formStyles from "./Form.module.css";
import Input from "./Input";
import Select from "./select";

const PetForm = ({ handleSubmit, petData, btnText }) => {
  const [pet, setpet] = useState(petData || {});
  const [preview, setPreview] = useState({});
  const colors = ["Branco", "Preto", "Caramelo", "Mesclado"];
  function onfilechange(e) {
    setPreview(Array.from(e.target.files));
    setpet({ ...pet, images: Array.from(e.target.files) });
  }
  function handlChange(e) {
    setpet({ ...pet, [e.target.name]: [e.target.value] });
  }
  function handlColor(e) {
    setpet({ ...pet, color: e.target.options[e.target.selectedIndex].text });
  }
  function submit(e) {
    e.preventDefault();
    handleSubmit(pet);
  }
  return (
    <form onSubmit={submit} className={formStyles.form_container}>
      <div className={formStyles.preview_pet_images}>
        {preview.length > 0
          ? preview.map((image, index) => (
              <img
                src={URL.createObjectURL(image)}
                alt={pet.name}
                key={`${pet.name}+${index}`}
              />
            ))
          : pet.images &&
            pet.images
            .filter((image) => typeof image === 'string')
              .map((image, index) => (
                <>
                  <img
                    src={`${process.env.REACT_APP_API}/images/pets/${image}`}
                    alt={pet.name}
                    key={`${pet.name}+${index}`}
                  />
                </>
              ))}
      </div>
      <Input
        text="Imagens do Pet"
        type="file"
        name="images"
        handleOnChange={onfilechange}
        multiple={true}
      />
      <Input
        text="Nome do Pet"
        type="text"
        name="name"
        placeholder="Digite o nome"
        handleOnChange={handlChange}
        value={pet.name || ""}
      />
      <Input
        text="Idade do Pet"
        type="text"
        name="age"
        placeholder="Digite o Idade"
        handleOnChange={handlChange}
        value={pet.age || ""}
      />
      <Input
        text="Peso do Pet"
        type="number"
        name="weigth"
        placeholder="Digite o peso"
        handleOnChange={handlChange}
        value={pet.weigth || ""}
      />
      <Select
        name={"color"}
        text="selecione a cor"
        options={colors}
        handleOnChange={handlColor}
        value={pet.color || ""}
      />
      <input type="submit" value={btnText} />
    </form>
  );
};

export default PetForm;
