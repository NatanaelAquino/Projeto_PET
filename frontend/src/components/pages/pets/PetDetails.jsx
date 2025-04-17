import React from "react";
import api from "../../../utils/api";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

/* hooks */

import useFlashMessage from "../../../hooks/useFlashMessage";

import styles from "./PetDetails.module.css";
function PetDetails() {
  const [pet, setPet] = useState([]);

  const { id } = useParams();
  const { setFlashMessage } = useFlashMessage();
  const [token] = useState(localStorage.getItem("token"));

  useEffect(() => {
    api.get(`/pets/${id}`).then((response) => {
      setPet(response.data.pet);
    });
  }, [id]);
  async function  schedule() {
    
    let msgType = 'sucess'

    const data = await api.patch(`pets/schedule/${pet._id}`, {
      Authorization: `Bearer ${JSON.parse(token)}`
    }).then((response)=>{
      return response.data
    }).catch((err) => { 
      msgType = 'error'
      return err.response.data
    })

    setFlashMessage(data.message, msgType)


  }
  return (
    <>
      {pet.name && (
        <section className={styles.pet_details_container}>
          <div className={styles.pet_details_header}>
            <h1>Conhecendo o pet :{pet.name}</h1>
          </div>
          <div className={styles.pet_image}>
            {pet.images.map((image, index) => (
              <img
                src={`${process.env.REACT_APP_API}/images/pets/${image}`}
                alt={pet.name}
                key={index}
              />
            ))}
          </div>
          <p>
            <span className="bold">Peso: {pet.weight}kg</span>
          </p>
          <p>
            <span className="bold">Idade: {pet.weight}anos</span>
          </p>
          {token ? (
            <button onClick={schedule}>
              Solicitar uma Visita
            </button>
          ) : (
            <p>Voce precisa <Link to="/register">criar uma conta </Link>para solicitar a visita</p>
          )}
        </section>
      )}
    </>
  );
}

export default PetDetails;
