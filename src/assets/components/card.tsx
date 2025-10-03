import { useState, useEffect, useRef } from 'react'

function Card() {
  const [volabelAnzahl, setVolabelAnzahl] = useState(0)
  const [zufallVokabelIndex, setZufallVokabelIndex] = useState(0)
  const vokabelkarte = useRef<HTMLDivElement>(null)
  const [vokabelArray, setVokabelArray] = useState<string[]>([])
  const [uebersetzungsArray, setUebersetzungsArray] = useState<string[]>([])
  const [lernFortschrittArray, setLernFortschrittArray] = useState<number[]>([])
  const [istVerdeckt, setIstVerdeckt] = useState(false)

  // Karte drehen: Deutsch -> Spanisch
  function dreheKarte() {
    if (vokabelkarte.current) {
      vokabelkarte.current.innerHTML = uebersetzungsArray[zufallVokabelIndex] || ''
      setIstVerdeckt(false)
    }
  }

  // Neue Vokabel laden
  function ladeNeueVokabel() {
    if (vokabelArray.length === 0) return

    // Berechne zufälligen Index synchron
    let index: number
    let lernFortschritt: number
    do {
      index = Math.floor(Math.random() * volabelAnzahl)
      lernFortschritt = lernFortschrittArray[index] || 0
    } while (lernFortschritt >= 5)

    // Eventuell nach Lernfortschritt filtern
    if (lernFortschritt > 0 && Math.random() >= 1 / lernFortschritt) {
      return ladeNeueVokabel() // Rekursiv neue wählen
    }

    setZufallVokabelIndex(index)

    if (vokabelkarte.current) {
      console.log("Vokabel : ", vokabelArray[index]);
      vokabelkarte.current.innerHTML = vokabelArray[index] || ''
      setIstVerdeckt(true)
    }
  }

  function richtig() {
    const fortschritt = lernFortschrittArray[zufallVokabelIndex] || 0
    const neuesArray = [...lernFortschrittArray]
    if (fortschritt < 5) neuesArray[zufallVokabelIndex] += 1
    setLernFortschrittArray(neuesArray)
    ladeNeueVokabel()
  }

  function falsch() {
    const neuesArray = [...lernFortschrittArray]
    neuesArray[zufallVokabelIndex] = 0
    setLernFortschrittArray(neuesArray)
    ladeNeueVokabel()
  }

  async function initVokabeln() {
    const vokabeln: string[] = []
    const uebersetzungen: string[] = []
    const fortschritte: number[] = []

    const res = await fetch('http://localhost:5000/api/holeDaten')
    const data = await res.json()
    data.lines.forEach((line: string) => {
      const [uebersetzung, vokabel, lernfortschritt] = line.split(';')
      if (uebersetzung && vokabel) {
        console.log(uebersetzung, vokabel);
        vokabeln.push(uebersetzung)
        uebersetzungen.push(vokabel)
        fortschritte.push(Number(lernfortschritt) || 0)
      }
    })

    setVokabelArray(vokabeln)
    setUebersetzungsArray(uebersetzungen)
    setLernFortschrittArray(fortschritte)
    setVolabelAnzahl(vokabeln.length)
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

  useEffect(() => {
    initVokabeln()
  }, [])

  useEffect(() => {
    if (vokabelArray.length > 0) ladeNeueVokabel()
  }, [vokabelArray])

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '800px',
          flexDirection: 'column',
          backgroundColor: '#aaf4dc',
        }}
      >
        <div
          ref={vokabelkarte}
          onClick={dreheKarte}
          style={{
            height: '500px',
            width: '500px',
            backgroundColor: '#ffffff',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: '30px'
          }}
        >
        </div>
        <div style={{ display: 'flex', gap: '10px', paddingTop: '10px' }}>
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
