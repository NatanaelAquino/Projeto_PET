import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Context } from "../../../context/UserContext";

import Input from "../../form/Input";
import sytle from "../../form/Form.module.css";
const Register = () => {
  const [user, setUser] = useState({});
  const {register} = useContext(Context)
  function handleOnChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }
  function handlSumit(e) {
    e.preventDefault();
    register(user)
  }
  return (
    <section className={sytle.form_container}>
      <h1>Register</h1>
      <form onSubmit={handlSumit}>
        <Input
          text="name"
          type={"text"}
          name={"name"}
          placeholder={"Digite o seu nome "}
          handleOnChange={handleOnChange}
        />
        <Input
          text="Telefone"
          type={"text"}
          name={"phone"}
          placeholder={"Digite o seu Telefone "}
          handleOnChange={handleOnChange}
        />
        <Input
          text="E-mail"
          type={"email"}
          name={"email"}
          placeholder={"Digite o seu E-mail "}
          handleOnChange={handleOnChange}
        />
        <Input
          text="Senha"
          type={"password"}
          name={"password"}
          placeholder={"Digite o sua senha "}
          handleOnChange={handleOnChange}
        />
        <Input
          text="Confirmação de senha"
          type={"password"}
          name={"confirmpassword"}
          placeholder={"Cofirme a sua senha"}
          handleOnChange={handleOnChange}
        />
        <input type="submit" value="Cadastrar" />
      </form>
      <p>
        Já tem conta? <Link to={"/"}>Clique Aqui</Link>
      </p>
    </section>
  );
};

export default Register;
