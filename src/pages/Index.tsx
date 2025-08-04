import { useState } from "react";
import { Home } from "./Home";
import { TrabalhoDetails } from "./TrabalhoDetails";
import { Booking } from "./Booking";
import { Avaliacoes } from "./Avaliacoes";
import { Trabalho, Horario, Profissional } from "@/types/beauty";

type Page = 'home' | 'trabalho-details' | 'booking' | 'avaliacoes';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedTrabalho, setSelectedTrabalho] = useState<Trabalho | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null);

  const handleViewTrabalho = (trabalho: Trabalho) => {
    setSelectedTrabalho(trabalho);
    setCurrentPage('trabalho-details');
  };

  const handleBooking = (trabalho: Trabalho, horario: Horario) => {
    setSelectedTrabalho(trabalho);
    setSelectedHorario(horario);
    setCurrentPage('booking');
  };

  const handleViewAvaliacoes = (profissional: Profissional) => {
    setSelectedProfissional(profissional);
    setCurrentPage('avaliacoes');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedTrabalho(null);
    setSelectedHorario(null);
    setSelectedProfissional(null);
  };

  const handleBackToDetails = () => {
    setCurrentPage('trabalho-details');
    setSelectedHorario(null);
  };

  const handleBookingSuccess = () => {
    handleBackToHome();
  };

  switch (currentPage) {
    case 'trabalho-details':
      return selectedTrabalho ? (
        <TrabalhoDetails
          trabalho={selectedTrabalho}
          onBack={handleBackToHome}
          onBooking={handleBooking}
        />
      ) : (
        <Home onViewTrabalho={handleViewTrabalho} />
      );

    case 'booking':
      return selectedTrabalho && selectedHorario ? (
        <Booking
          trabalho={selectedTrabalho}
          horario={selectedHorario}
          onBack={handleBackToDetails}
          onSuccess={handleBookingSuccess}
        />
      ) : (
        <Home onViewTrabalho={handleViewTrabalho} />
      );

    case 'avaliacoes':
      return selectedProfissional ? (
        <Avaliacoes
          profissional={selectedProfissional}
          onBack={handleBackToHome}
        />
      ) : (
        <Home onViewTrabalho={handleViewTrabalho} />
      );

    default:
      return <Home onViewTrabalho={handleViewTrabalho} />;
  }
};

export default Index;
