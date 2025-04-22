import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";
import { fetchWithAuth } from "../../utils/api";
import ClientHeader from "../../components/clientHeader.jsx";
import InputFieldLong from "../../components/inputFieldLong.jsx";
import Button from "../../components/button.jsx";


