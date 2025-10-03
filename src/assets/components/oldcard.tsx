import { useState, useEffect, useRef } from 'react'

function Card() {

    const [volabelAnzahl, setVolabelAnzahl] = useState(0);
    const [zufallVokabelIndex, setZufallVokabelIndex] = useState(0);
    var vokabelkarte = useRef<HTMLDivElement>(null);
    const [vokabelArray, setVokabelArray] = useState<string[]>([]);
    const [uebersetzungsArray, setUebersetzungsArray] = useState<string[]>([]);
    const [lernFortschrittArray, setLernFortschrittArray] = useState<number[]>([]);
    const [istVerdeckt, setIstVerdeckt] = useState(false);

    function dreheKarte(){
        console.log("zufallVokabelIndex ", zufallVokabelIndex);
        if(vokabelkarte.current){
            vokabelkarte.current.innerHTML = uebersetzungsArray[zufallVokabelIndex];
            setIstVerdeckt(false);
        }
    }

    function speichereVokabeln(){
        const lines = vokabelArray.map((vokabel, i) => {
            const uebersetzung = uebersetzungsArray[i] || ""; // ! ersetzt alle falsy Werte
            const fortschritt = lernFortschrittArray[i] ?? 0; // ! ersetzt nur null oder undefined
            return `${vokabel};${uebersetzung};${fortschritt}`;
        })

        console.log("lines : ", lines);

        fetch("http://localhost:5000/api/speichern", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lines })
        })
    }

    function berechneLernIndex(): number {
    let index: number;
    let lernFortschritt: number;

    do {
        index = Math.floor(Math.random() * volabelAnzahl);
        lernFortschritt = lernFortschrittArray[index];
    } while (lernFortschritt >= 5);

    if (lernFortschritt === 0 || Math.random() < 1 / lernFortschritt) {
        return index;
    } else {
        return berechneLernIndex();
    }
    }


    function ladeNeueVokabel() {
        const index = berechneLernIndex();
        setZufallVokabelIndex(index);

        if (vokabelkarte.current) {
            vokabelkarte.current.innerHTML = vokabelArray[index];
            console.log("vokabelArray", vokabelArray);
            setIstVerdeckt(true);
        }
    }


    function richtig(){
        switch(lernFortschrittArray[zufallVokabelIndex]){
            case 5:
                break;
            default:
                lernFortschrittArray[zufallVokabelIndex] += 1;
        }
        ladeNeueVokabel();
    }

    function falsch(){
        lernFortschrittArray[zufallVokabelIndex] = 0;
        ladeNeueVokabel();
    }

    async function initVokabeln(){
        const vokabeln: string[] = [];
        const uebersetzungen: string[] = [];

        const res = await fetch("http://localhost:5000/api/holeDaten");
        const data = await res.json();
        data.lines.forEach((line: string) => {
            const [deutsch, spanisch, lernfortschritt] = line.split(";");
            console.log(deutsch, spanisch, lernfortschritt);
            if(deutsch && spanisch){
                vokabeln.push(spanisch);
                uebersetzungen.push(deutsch);
                lernFortschrittArray.push(Number(lernfortschritt) || 0);
                setVolabelAnzahl(vokabeln.length + 1);
            }
        });

        setVokabelArray(vokabeln);
        setUebersetzungsArray(uebersetzungen);

    }

useEffect(() => {
    initVokabeln().then(() => console.log("TestiTesti : ", volabelAnzahl));
}, [])

useEffect(() => {
    if (vokabelArray.length > 0) {
    ladeNeueVokabel();
  }
}, [vokabelArray])


  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" , height: "800px", flexDirection: "column", backgroundColor: "#aaf4dc"}}>
        <div ref={vokabelkarte} onClick={dreheKarte} style={{ height: "500px", width: "500px", backgroundColor: "#ffffff", borderRadius: "30px", display: "flex", alignItems:"center", justifyContent:"center", textAlign:"center"}}>
            
        </div>
        <div style={{ display: "flex", gap: "10px", paddingTop: "10px" }}>
        <button onClick={falsch} disabled={istVerdeckt}>
            falsch
        </button>
        <button onClick={richtig} disabled={istVerdeckt}>
            richtig
        </button>
      </div>
      </div>
        <button onClick={speichereVokabeln}>
            speichern
        </button>
    </>
  )
}

export default Card