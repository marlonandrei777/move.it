import { createContext, ReactNode, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';

interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;
}

interface ChallengesContextData {
    level: number;
    currentExperience: number;
    experienceToNextLevel: number;
    challengesCompleted: number;
    activeChallenge: Challenge;
    levelUp: () => void;
    startNewChallenge: () => void;
    resetChallenge: () => void;
    completeChallenge: () => void;
    closeLevelUpModal: () => void;
}

interface ChallengesProviderProps {
    children: ReactNode;
    level: number;
    currentExperience: number;
    challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({ 
    children, 
    ...rest } : ChallengesProviderProps) {
    const [level, setLevel] = useState(rest.level);
    const [currentExperience, setCurrentExperience] = useState(rest.currentExperience);
    const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted);

    const [activeChallenge, setActiveChallenge] = useState(null)
    const [isLEvelUpModalOpen, setIsLevelUpModalOpen] = useState(false) /*criei umestado para o modal*/

    const experienceToNextLevel = Math.pow((level + 1) * 4, 2)

    useEffect(() => { /* executa uma única vez, assim q esse conponente for exibido em tela */ 
        Notification.requestPermission(); /* NOTIFICAÇÃO NO BROWSER */
    }, [])

    useEffect(() => {
        Cookies.set('level', String(level));
        Cookies.set('currentExperience', String(currentExperience));
        Cookies.set('challengesCompleted', String(challengesCompleted));
    }, [level, currentExperience, challengesCompleted]); /*executa assim q uma mudança estiver sido feita no []*/

    function levelUp() {
        setLevel(level + 1);
        setIsLevelUpModalOpen(true); /* up dellevel o modal abre */
    }

    function closeLevelUpModal() {
        setIsLevelUpModalOpen(false); /* fecha o modal */ 
    }

    function startNewChallenge() {
        const randomChallengeIndex = Math.floor(Math.random() * challenges.length)
        const challenge = challenges[randomChallengeIndex];

        setActiveChallenge(challenge)

        new Audio('/notification.mp3').play(); /* som de notificação ao disparar a notificação no browser */

        if(Notification.permission === 'granted') { /* NOTIFICAÇÃO NO BROWSER */
            new Notification('Novo desafio 🎉', {
                body: `Valendo ${challenge.amount}xp!`
            })
        }
    }

    function resetChallenge() {
        setActiveChallenge(null);
    }

    function completeChallenge() {
        if(!activeChallenge) {
            return;
        }

        const { amount } = activeChallenge;

        let finalExperience = currentExperience + amount;

        if(finalExperience >= experienceToNextLevel) {
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp();
        }

        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChallengesCompleted(challengesCompleted + 1); 
    }

    return(
        <ChallengesContext.Provider 
            value={{ 
                level, 
                currentExperience,
                experienceToNextLevel,
                challengesCompleted, 
                levelUp,
                startNewChallenge,
                activeChallenge,
                resetChallenge,
                completeChallenge,
                closeLevelUpModal,
            }}
        >
            { children }

           { isLEvelUpModalOpen && <LevelUpModal /> }
        </ChallengesContext.Provider>
    );
}