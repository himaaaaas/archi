import pptxgen from 'pptxgenjs'

const COLORS = {
  dark: '2a3a18',
  green: '4a7030',
  lightGreen: 'e8f4d8',
  muted: '8aaa60',
  white: 'ffffff',
  border: 'dce6cc',
  bg: 'f4f7f0',
}

async function getImageBase64(url) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function fetchPlantImage(scientificName) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName)}`
    )
    const data = await res.json()
    if (data?.thumbnail?.source) {
      return await getImageBase64(data.thumbnail.source)
    }
    return null
  } catch {
    return null
  }
}

export async function exportToPptx(result, form, onProgress) {
  onProgress?.('Fetching plant images…')

  const prs = new pptxgen()
  prs.layout = 'LAYOUT_WIDE'
  prs.title = `LandPal — ${form.country} ${form.projectType}`

  const projectTitle = [form.country, form.region?.replace('__c:',''), form.projectType]
    .filter(Boolean).join(' · ')
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  // ── SLIDE 1: Cover ──
  const cover = prs.addSlide()
  cover.background = { color: '2a3a18' }
  cover.addText('⌘', {
    x: 1, y: 0.8, w: 11, h: 0.8,
    fontSize: 36, color: '8aaa60', align: 'center'
  })
  cover.addText('Land AI', {
    x: 1, y: 1.6, w: 11, h: 1.2,
    fontSize: 52, bold: false, color: 'e8f4d8',
    align: 'center', fontFace: 'Georgia'
  })
  cover.addText('Landscape Palette', {
    x: 1, y: 2.7, w: 11, h: 0.6,
    fontSize: 20, color: '8aaa60', align: 'center'
  })
  cover.addText(projectTitle, {
    x: 1, y: 3.5, w: 11, h: 0.5,
    fontSize: 14, color: 'e8f4d8', align: 'center'
  })
  cover.addText(today, {
    x: 1, y: 4.1, w: 11, h: 0.4,
    fontSize: 11, color: '6a8a50', align: 'center'
  })

  // ── SLIDE 2: Summary table ──
  const summary = prs.addSlide()
  summary.background = { color: 'f4f7f0' }
  summary.addText('Plant Summary', {
    x: 0.5, y: 0.3, w: 12, h: 0.6,
    fontSize: 24, bold: true, color: '2a3a18', fontFace: 'Georgia'
  })
  summary.addText(projectTitle, {
    x: 0.5, y: 0.9, w: 12, h: 0.3,
    fontSize: 11, color: '8aaa60'
  })

  const allPlants = (result.categories || []).flatMap(cat =>
    (cat.plants || []).map(p => ({ ...p, category: cat.name }))
  )

  const tableRows = [
    [
      { text: 'Common Name', options: { bold: true, color: 'ffffff', fill: { color: '2a3a18' } } },
      { text: 'Botanical Name', options: { bold: true, color: 'ffffff', fill: { color: '2a3a18' } } },
      { text: 'Category', options: { bold: true, color: 'ffffff', fill: { color: '2a3a18' } } },
      { text: 'Max Height', options: { bold: true, color: 'ffffff', fill: { color: '2a3a18' } } },
      { text: 'Spread', options: { bold: true, color: 'ffffff', fill: { color: '2a3a18' } } },
      { text: 'Water', options: { bold: true, color: 'ffffff', fill: { color: '2a3a18' } } },
    ],
    ...allPlants.map((p, i) => [
      { text: p.commonName || '', options: { fill: { color: i % 2 === 0 ? 'ffffff' : 'f4f9ee' } } },
      { text: p.scientificName || '', options: { italic: true, fill: { color: i % 2 === 0 ? 'ffffff' : 'f4f9ee' } } },
      { text: p.category || '', options: { fill: { color: i % 2 === 0 ? 'ffffff' : 'f4f9ee' } } },
      { text: p.maxHeight || '—', options: { fill: { color: i % 2 === 0 ? 'ffffff' : 'f4f9ee' } } },
      { text: p.spread || '—', options: { fill: { color: i % 2 === 0 ? 'ffffff' : 'f4f9ee' } } },
      { text: p.water || '—', options: { fill: { color: i % 2 === 0 ? 'ffffff' : 'f4f9ee' } } },
    ])
  ]

  summary.addTable(tableRows, {
    x: 0.5, y: 1.3, w: 12,
    fontSize: 10, border: { color: 'dce6cc' },
    rowH: 0.3, colW: [2.2, 2.5, 1.8, 1.5, 1.5, 1.5]
  })

  // ── SLIDES 3+: One slide per category, grid of plant cards ──
  for (const cat of (result.categories || [])) {
    const plants = cat.plants || []
    if (plants.length === 0) continue

    // 3 plants per row, max 6 per slide
    const plantsPerSlide = 6
    const chunks = []
    for (let i = 0; i < plants.length; i += plantsPerSlide) {
      chunks.push(plants.slice(i, i + plantsPerSlide))
    }

    for (const chunk of chunks) {
      const slide = prs.addSlide()
      slide.background = { color: 'f4f7f0' }

      // Category header
      slide.addText(cat.name, {
        x: 0.5, y: 0.2, w: 12, h: 0.5,
        fontSize: 22, bold: false, color: '2a3a18', fontFace: 'Georgia'
      })
      slide.addText(projectTitle, {
        x: 0.5, y: 0.7, w: 12, h: 0.25,
        fontSize: 9, color: '8aaa60'
      })

      const cols = 3
      const cardW = 3.8
      const cardH = 3.6
      const startX = 0.5
      const startY = 1.1
      const gapX = 0.25
      const gapY = 0.25

      for (let i = 0; i < chunk.length; i++) {
        const plant = chunk[i]
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = startX + col * (cardW + gapX)
        const y = startY + row * (cardH + gapY)

        // Card background
        slide.addShape(prs.ShapeType.rect, {
          x, y, w: cardW, h: cardH,
          fill: { color: 'ffffff' },
          line: { color: 'dce6cc', width: 1 }
        })

        // Fetch and add image
        const imgData = await fetchPlantImage(plant.scientificName)
        if (imgData) {
          slide.addImage({
            data: imgData,
            x: x + 0.1, y: y + 0.1,
            w: cardW - 0.2, h: 1.6,
            sizing: { type: 'cover', w: cardW - 0.2, h: 1.6 }
          })
        } else {
          slide.addShape(prs.ShapeType.rect, {
            x: x + 0.1, y: y + 0.1,
            w: cardW - 0.2, h: 1.6,
            fill: { color: 'e8f4d8' },
            line: { color: 'dce6cc', width: 1 }
          })
        }

        // Common name
        slide.addText(plant.commonName || '', {
          x: x + 0.15, y: y + 1.8, w: cardW - 0.3, h: 0.35,
          fontSize: 12, bold: true, color: '2a3a18'
        })

        // Scientific name
        slide.addText(plant.scientificName || '', {
          x: x + 0.15, y: y + 2.1, w: cardW - 0.3, h: 0.28,
          fontSize: 9, italic: true, color: '8aaa60'
        })

        // Dimensions
        const dims = [
          plant.maxHeight ? `H: ${plant.maxHeight}` : null,
          plant.spread ? `W: ${plant.spread}` : null,
          plant.rootDepth ? `Root: ${plant.rootDepth}` : null,
        ].filter(Boolean).join('  ·  ')

        slide.addText(dims, {
          x: x + 0.15, y: y + 2.45, w: cardW - 0.3, h: 0.25,
          fontSize: 8, color: '5a8040'
        })

        // Justification
        slide.addText(plant.note || '', {
          x: x + 0.15, y: y + 2.75, w: cardW - 0.3, h: 0.75,
          fontSize: 8, color: '6a7a58',
          wrap: true, valign: 'top'
        })
      }
    }
  }

  // Save the file
  onProgress?.('Building PPTX…')
  await prs.writeFile({ fileName: `LandPal — ${projectTitle}.pptx` })
  onProgress?.(null)
}
