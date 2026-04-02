function sanitize(str) {
  return (str || '-').replace(/[^\x20-\x7E]/g, '').substring(0, 50)
}

function dxfHeader() {
  return [
    '0', 'SECTION',
    '2', 'HEADER',
    '9', '$ACADVER',
    '1', 'AC1032',
    '9', '$INSUNITS',
    '70', '4',
    '9', '$MEASUREMENT',
    '70', '1',
    '9', '$EXTMIN',
    '10', '0', '20', '0', '30', '0',
    '9', '$EXTMAX',
    '10', '297', '20', '210', '30', '0',
    '0', 'ENDSEC',
  ].join('\n') + '\n'
}

function dxfTables(categories) {
  const colors = {
    'TREES': 3, 'PALMS': 2, 'SHRUBS': 4, 'GROUND_CO': 83,
    'CLIMBERS': 6, 'PERENNIAL': 200, 'ANNUALS': 1,
    'SUCCULENT': 30, 'GRASSES': 62, 'AQUATIC': 5,
    'HEDGES': 94, 'DEFAULT': 7, 'TITLE': 7,
    'TABLE': 7, 'BORDER': 7,
  }

  const allLayers = [
    'TITLE', 'BORDER', 'TABLE',
    ...categories.map(c =>
      c.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 9)
    )
  ]

  const uniqueLayers = [...new Set(allLayers)]

  let out = [
    '0', 'SECTION',
    '2', 'TABLES',
    '0', 'TABLE',
    '2', 'LTYPE',
    '5', 'A',
    '100', 'AcDbSymbolTable',
    '70', '1',
    '0', 'LTYPE',
    '5', 'B',
    '100', 'AcDbSymbolTableRecord',
    '100', 'AcDbLinetypeTableRecord',
    '2', 'CONTINUOUS',
    '70', '0',
    '3', 'Solid line',
    '72', '65',
    '73', '0',
    '40', '0.0',
    '0', 'ENDTAB',
    '0', 'TABLE',
    '2', 'LAYER',
    '5', 'C',
    '100', 'AcDbSymbolTable',
    '70', String(uniqueLayers.length),
  ].join('\n') + '\n'

  uniqueLayers.forEach((name, i) => {
    const colorKey = name.substring(0, 9)
    const color = colors[colorKey] || 7
    out += [
      '0', 'LAYER',
      '5', String(10 + i),
      '100', 'AcDbSymbolTableRecord',
      '100', 'AcDbLayerTableRecord',
      '2', name,
      '70', '0',
      '62', String(color),
      '6', 'CONTINUOUS',
    ].join('\n') + '\n'
  })

  out += ['0', 'ENDTAB', '0', 'ENDSEC'].join('\n') + '\n'
  return out
}

function dxfBlocks() {
  return [
    '0', 'SECTION',
    '2', 'BLOCKS',
    '0', 'BLOCK',
    '5', '20',
    '100', 'AcDbEntity',
    '8', '0',
    '100', 'AcDbBlockBegin',
    '2', '*MODEL_SPACE',
    '70', '0',
    '10', '0', '20', '0', '30', '0',
    '3', '*MODEL_SPACE',
    '1', '',
    '0', 'ENDBLK',
    '5', '21',
    '100', 'AcDbEntity',
    '8', '0',
    '100', 'AcDbBlockEnd',
    '0', 'BLOCK',
    '5', '22',
    '100', 'AcDbEntity',
    '8', '0',
    '100', 'AcDbBlockBegin',
    '2', '*PAPER_SPACE',
    '70', '0',
    '10', '0', '20', '0', '30', '0',
    '3', '*PAPER_SPACE',
    '1', '',
    '0', 'ENDBLK',
    '5', '23',
    '100', 'AcDbEntity',
    '8', '0',
    '100', 'AcDbBlockEnd',
    '0', 'ENDSEC',
  ].join('\n') + '\n'
}

function dxfObjects() {
  return [
    '0', 'SECTION',
    '2', 'OBJECTS',
    '0', 'DICTIONARY',
    '5', '30',
    '100', 'AcDbDictionary',
    '281', '1',
    '0', 'ENDSEC',
  ].join('\n') + '\n'
}

function dxfEntities(result, form) {
  const projectTitle = [form.country, form.region, form.projectType]
    .filter(Boolean).join(' - ')
  const today = new Date().toLocaleDateString('en-GB')
  const allPlants = (result.categories || []).flatMap(cat =>
    (cat.plants || []).map(p => ({ ...p, category: cat.name }))
  )

  const addLine = (layer, x1, y1, x2, y2) => [
    '0', 'LINE',
    '100', 'AcDbEntity',
    '8', layer,
    '100', 'AcDbLine',
    '10', String(x1), '20', String(y1), '30', '0',
    '11', String(x2), '21', String(y2), '31', '0',
  ].join('\n') + '\n'

  const addText = (layer, x, y, h, text) => [
    '0', 'TEXT',
    '100', 'AcDbEntity',
    '8', layer,
    '100', 'AcDbText',
    '10', String(x), '20', String(y), '30', '0',
    '40', String(h),
    '1', sanitize(text),
    '100', 'AcDbText',
  ].join('\n') + '\n'

  const addCircle = (layer, x, y, r) => [
    '0', 'CIRCLE',
    '100', 'AcDbEntity',
    '8', layer,
    '100', 'AcDbCircle',
    '10', String(x), '20', String(y), '30', '0',
    '40', String(r),
  ].join('\n') + '\n'

  let out = ['0', 'SECTION', '2', 'ENTITIES'].join('\n') + '\n'

  const W = 297, H = 210, M = 10

  // ── BORDER ──
  out += addLine('BORDER', M, M, W - M, M)
  out += addLine('BORDER', W - M, M, W - M, H - M)
  out += addLine('BORDER', W - M, H - M, M, H - M)
  out += addLine('BORDER', M, H - M, M, M)

  // ── TITLE ──
  out += addText('TITLE', M + 2, H - M - 6, 5, 'Land AI - Softscape Schedule')
  out += addText('TITLE', M + 2, H - M - 12, 3, projectTitle)
  out += addText('TITLE', W - M - 50, H - M - 6, 3, 'Date: ' + today)
  out += addLine('BORDER', M, H - M - 15, W - M, H - M - 15)

  // ── TABLE ──
  const tableX = M + 2
  const tableY = H - M - 22
  const rowH = 6

  const cols = [
    { label: '#', w: 6 },
    { label: 'Common Name', w: 35 },
    { label: 'Botanical Name', w: 42 },
    { label: 'Category', w: 28 },
    { label: 'Max H', w: 14 },
    { label: 'Spread', w: 14 },
    { label: 'Root', w: 12 },
    { label: 'Water', w: 14 },
  ]

  const totalW = cols.reduce((s, c) => s + c.w, 0)

  // Header row
  out += addLine('TABLE', tableX, tableY, tableX + totalW, tableY)
  out += addLine('TABLE', tableX, tableY - rowH, tableX + totalW, tableY - rowH)

  let cx = tableX
  cols.forEach(col => {
    out += addText('TABLE', cx + 1, tableY - rowH + 2, 2.5, col.label)
    out += addLine('TABLE', cx, tableY, cx, tableY - rowH)
    cx += col.w
  })
  out += addLine('TABLE', cx, tableY, cx, tableY - rowH)

  // Data rows
  allPlants.forEach((plant, i) => {
    const rowY = tableY - rowH - i * rowH
    const vals = [
      String(i + 1),
      sanitize(plant.commonName),
      sanitize(plant.scientificName),
      sanitize(plant.category),
      sanitize(plant.maxHeight),
      sanitize(plant.spread),
      sanitize(plant.rootDepth),
      sanitize(plant.water),
    ]

    out += addLine('TABLE', tableX, rowY - rowH, tableX + totalW, rowY - rowH)

    let cx = tableX
    vals.forEach((val, j) => {
      out += addText('TABLE', cx + 1, rowY - rowH + 2, 2, val)
      out += addLine('TABLE', cx, rowY, cx, rowY - rowH)
      cx += cols[j].w
    })
    out += addLine('TABLE', cx, rowY, cx, rowY - rowH)
  })

  // ── PLANT SYMBOLS GRID ──
  const gridX = tableX + totalW + 8
  const gridW = W - M - gridX - 2
  const symbolsPerRow = Math.max(1, Math.floor(gridW / 16))

  out += addText('TITLE', gridX, tableY + 2, 3, 'Plant Symbols')

  allPlants.forEach((plant, i) => {
    const col = i % symbolsPerRow
    const row = Math.floor(i / symbolsPerRow)
    const sx = gridX + col * 16 + 7
    const sy = tableY - 10 - row * 18

    const layerName = (plant.category || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 9) || 'DEFAULT'

    out += addCircle(layerName, sx, sy, 5)
    out += addText('TABLE', sx - 1.5, sy - 1, 2, String(i + 1))
    out += addText('TABLE', sx - 7, sy - 8, 1.8,
      sanitize(plant.commonName).substring(0, 10))
  })

  out += ['0', 'ENDSEC', '0', 'EOF'].join('\n') + '\n'
  return out
}

export function exportToDxf(result, form) {
  const categories = result.categories || []
  const content = dxfHeader() +
    dxfTables(categories) +
    dxfBlocks() +
    dxfEntities(result, form) +
    dxfObjects()

  const blob = new Blob([content], { type: 'application/dxf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const projectTitle = [form.country, form.region, form.projectType]
    .filter(Boolean).join(' - ')
  a.download = `Land AI - ${projectTitle}.dxf`
  a.click()
  URL.revokeObjectURL(url)
}
