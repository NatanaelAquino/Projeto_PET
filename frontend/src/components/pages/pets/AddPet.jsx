import React from "react";
import styles from "./AddPet.module.css";
import PetForm from "../../form/PetForm";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";

/* Hoojs */
import useFlashMessage from "../../../hooks/useFlashMessage";

const AddPet = () => {
  const [token] = useState(localStorage.getItem("token") || "");
  const { setFlashMessage } = useFlashMessage();
  const navigate = useNavigate();
  async function registerpet(pet) {
    const formData = new FormData();

    Object.keys(pet).forEach((key) => {
      if (key === "images") {
        for (let i = 0; i < pet[key].length; i++) {
          formData.append("images", pet[key][i]);
        }
      } else {
        formData.append(key, pet[key]);
      }
    });

    let msgType = "success";

    try {
      const { data } = await api.post("pets/create", formData, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFlashMessage(data.message, msgType);
      navigate("/pets/mypets");
    } catch (err) {
      msgType = "error";
      setFlashMessage(err.response.data.message, msgType);
    }
  }
  return (
    <section className={styles.addpet_header}>
      <div>
        <h1>Cadastre um pet</h1>
        <p>Depois ele ficará disponivel para adoção</p>
      </div>
      <PetForm handleSubmit={registerpet} btnText={"Cadastrar PET"} />
      
    </section>
  );
};

export default AddPet;
