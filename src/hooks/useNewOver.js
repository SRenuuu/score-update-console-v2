import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, doc, serverTimestamp, updateDoc, query, where, getDocs, getCountFromServer } from "firebase/firestore";

import { db } from "../firebase/config";
import { useInning } from '../hooks/useInning'

export const useNewOver = () => {
    let navigate = useNavigate();
    const { inning, team, updateOver } = useInning();

    const updateBowler = async (bowler) => {

        const bowlingRef = collection(db, 'bowling');
        const liveRef = doc(db, 'main', 'live');

        const bowlingQuery = query(collection(db, "bowling"), where("inning", "==", inning), where("name", "==", bowler));

        const isExistingBowler = await getCountFromServer(bowlingQuery);
        if (isExistingBowler.data().count) {
            const bowlingSnapshot = await getDocs(bowlingQuery);
            bowlingSnapshot.forEach(async (bowlingDoc) => {
                const liveDoc = {
                    "bowler.name": bowlingDoc.data().name,
                    "bowler.score": bowlingDoc.data().score,
                    "bowler.balls": bowlingDoc.data().balls,
                    "bowler.wickets": bowlingDoc.data().wickets,
                    "thisOver": {}
                }

                await updateDoc(liveRef, liveDoc)
                .catch(err => {
                    setError(err.message);
                });
            });
        } else {
            const liveDoc = {
                "bowler.name": bowler,
                "bowler.score": 0,
                "bowler.balls": 0,
                "bowler.wickets": 0,
                "thisOver": {}
            }

            const bowlerDoc = {
                timestamp: serverTimestamp(),
                team: team,
                inning: inning,
                name: bowler,
                balls: 0,
                score: 0,
                wickets: 0,
                maiden: 0
            }

            await updateDoc(liveRef, liveDoc)
            .catch(err => {
                setError(err.message);
            });

            await addDoc(bowlingRef, bowlerDoc)
            .catch(err => {
                setError(err.message);
            });
        }
        updateOver({
            bowler: bowler
        });
        navigate("/");
    }

    return {
        updateBowler
    }
}