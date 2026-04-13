import { useState, useEffect, useRef } from 'react';

export const useSpeechRecognition = ({
  lang = 'pt-BR',
  continuous = true,
  interimResults = true,
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [browserWarning, setBrowserWarning] = useState('');

  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(false);
  const restartingRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isBrave =
      typeof navigator !== 'undefined' &&
      (/Brave\//i.test(navigator.userAgent) || !!navigator.brave);

    if (isBrave) {
      setBrowserWarning(
        'Alguns navegadores podem limitar o reconhecimento de voz por configuracoes de privacidade. Se falhar, verifique permissao de microfone e configuracoes de protecao/privacidade para este site.'
      );
    } else {
      setBrowserWarning('');
    }

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Seu navegador nao suporta reconhecimento de voz. Use Chrome, Edge ou Safari.');
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += part + ' ';
        } else {
          interimText += part;
        }
      }

      if (finalText) setTranscript((prev) => prev + finalText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      const messages = {
        'no-speech': 'Nenhuma fala detectada. Tente novamente.',
        'audio-capture': 'Microfone nao encontrado. Verifique as permissoes.',
        'not-allowed': 'Permissao negada. Permita o acesso ao microfone.',
        network: isBrave
          ? 'Erro no reconhecimento de voz. Verifique conexao, permissao de microfone e configuracoes de privacidade/protecao do navegador para este site.'
          : 'Erro de rede no reconhecimento de voz. Verifique conexao, permissao de microfone e tente novamente.',
        aborted: 'Reconhecimento interrompido.',
      };

      // Evita loop de reinicio quando o provedor de reconhecimento esta indisponivel.
      if (event.error === 'network' || event.error === 'not-allowed') {
        shouldRestartRef.current = false;
      }

      setError(messages[event.error] || `Erro: ${event.error}`);
      setIsListening(false);
    };

    recognition.onstart = () => {
      setError(null);
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');

      if (continuous && shouldRestartRef.current && !restartingRef.current) {
        restartingRef.current = true;
        setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // Ignora erros de estado invalido durante reinicio automatico.
          } finally {
            restartingRef.current = false;
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [lang, continuous, interimResults]);

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    setError(null);
    shouldRestartRef.current = true;

    try {
      recognitionRef.current.start();
    } catch (e) {
      shouldRestartRef.current = false;
      setError('Nao foi possivel iniciar o microfone agora. Tente novamente.');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    shouldRestartRef.current = false;
    recognitionRef.current.stop();
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    browserWarning,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
};
