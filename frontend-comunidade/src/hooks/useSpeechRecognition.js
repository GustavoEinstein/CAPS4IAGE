import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for Web Speech API
 * Provides voice recognition capabilities with support for continuous recording
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.lang - Language code (default: 'pt-BR')
 * @param {boolean} options.continuous - Continuous recognition (default: true)
 * @param {boolean} options.interimResults - Show interim results (default: true)
 * @returns {Object} Speech recognition state and controls
 */
export const useSpeechRecognition = ({ 
    lang = 'pt-BR', 
    continuous = true, 
    interimResults = true 
} = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);

    // Check browser support on mount
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = continuous;
            recognitionRef.current.interimResults = interimResults;
            recognitionRef.current.lang = lang;

            // Event: result (when speech is recognized)
            recognitionRef.current.onresult = (event) => {
                console.log('Speech recognition result received:', event);
                let interimText = '';
                let finalText = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPart = event.results[i][0].transcript;
                    console.log('Transcript part:', transcriptPart, 'isFinal:', event.results[i].isFinal);
                    
                    if (event.results[i].isFinal) {
                        finalText += transcriptPart + ' ';
                    } else {
                        interimText += transcriptPart;
                    }
                }

                if (finalText) {
                    console.log('Final text:', finalText);
                    setTranscript(prev => prev + finalText);
                }
                
                if (interimText) {
                    console.log('Interim text:', interimText);
                }
                setInterimTranscript(interimText);
            };

            // Event: error
            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                
                const errorMessages = {
                    'no-speech': 'Nenhuma fala detectada. Tente novamente.',
                    'audio-capture': 'Microfone não encontrado. Verifique as permissões.',
                    'not-allowed': 'Permissão negada. Permita o acesso ao microfone.',
                    'network': 'Erro de rede. Verifique sua conexão.',
                    'aborted': 'Reconhecimento interrompido.'
                };
                
                setError(errorMessages[event.error] || `Erro: ${event.error}`);
                setIsListening(false);
            };

            // Event: end (recognition stopped)
            recognitionRef.current.onend = () => {
                setIsListening(false);
                setInterimTranscript('');
            };

            // Event: start
            recognitionRef.current.onstart = () => {
                console.log('Speech recognition started');
                setError(null);
                setIsListening(true);
            };

            // Event: audiostart
            recognitionRef.current.onaudiostart = () => {
                console.log('Audio capturing started');
            };

            // Event: soundstart
            recognitionRef.current.onsoundstart = () => {
                console.log('Sound detected');
            };

            // Event: speechstart
            recognitionRef.current.onspeechstart = () => {
                console.log('Speech detected');
            };
        } else {
            setIsSupported(false);
            setError('Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Safari.');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [lang, continuous, interimResults]);

    // Start listening
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setError(null);
            try {
                console.log('Attempting to start speech recognition...');
                console.log('Recognition settings:', {
                    lang: recognitionRef.current.lang,
                    continuous: recognitionRef.current.continuous,
                    interimResults: recognitionRef.current.interimResults
                });
                recognitionRef.current.start();
            } catch (err) {
                console.error('Error starting recognition:', err);
                setError('Erro ao iniciar gravação. Tente novamente.');
            }
        } else {
            console.log('Cannot start - already listening or no recognition object');
        }
    };

    // Stop listening
    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    // Toggle listening
    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Reset transcript
    const resetTranscript = () => {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
    };

    return {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        error,
        startListening,
        stopListening,
        toggleListening,
        resetTranscript
    };
};
