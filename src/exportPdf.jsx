import React from 'react'
import {
  Document, Page, Text, View, Image, StyleSheet, pdf, Font
} from '@react-pdf/renderer'

// ── Image fetching ─────────────────────────────────────────────
async function fetchImageAsBase64(url) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function fetchPlantImageBase64(scientificName) {
  if (!scientificName) return null
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName)}`
    )
    const data = await res.json()
    if (data?.thumbnail?.source) {
      return await fetchImageAsBase64(data.thumbnail.source)
    }
    return null
  } catch {
    return null
  }
}

async function buildImageMap(result) {
  const allPlants = (result.categories || []).flatMap(c => c.plants || [])
  const entries = await Promise.all(
    allPlants.map(async (p) => {
      const b64 = await fetchPlantImageBase64(p.scientificName)
      return [p.scientificName, b64]
    })
  )
  return Object.fromEntries(entries.filter(([, v]) => v !== null))
}

// ── Brand colours ──────────────────────────────────────────────
const C = {
  dark:    '#163422',
  green:   '#2d4b37',
  muted:   '#4c644e',
  pale:    '#99baa1',
  light:   '#c8ebd0',
  cream:   '#f8f7f2',
  bg:      '#f3f4f2',
  border:  '#dce8d0',
  white:   '#ffffff',
  amber:   '#b87820',
  amberBg: '#fff8eb',
  amberBorder: '#e8d090',
}

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Pages
  coverPage: {
    backgroundColor: C.dark,
    fontFamily: 'Helvetica',
  },
  page: {
    backgroundColor: C.cream,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.dark,
  },

  // Cover layout
  coverWrap: {
    flex: 1,
    justifyContent: 'space-between',
    padding: '56px 52px',
  },
  coverTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverBrand: {
    fontSize: 13,
    color: C.light,
    letterSpacing: 2,
    fontFamily: 'Helvetica',
  },
  coverTypeBadge: {
    fontSize: 8,
    color: C.pale,
    letterSpacing: 2,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: '#2d5040',
    borderRadius: 20,
    padding: '4px 12px',
  },
  coverCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  coverEyebrow: {
    fontSize: 8,
    color: C.pale,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 20,
    fontFamily: 'Helvetica',
  },
  coverTitle: {
    fontSize: 46,
    color: C.cream,
    fontFamily: 'Times-Roman',
    lineHeight: 1.15,
    marginBottom: 28,
    letterSpacing: -1,
  },
  coverTitleItalic: {
    fontSize: 46,
    color: '#90c878',
    fontFamily: 'Times-Roman',
    lineHeight: 1.15,
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  coverDivider: {
    borderTopWidth: 1,
    borderTopColor: '#2d5040',
    marginBottom: 24,
    marginTop: 8,
  },
  coverMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  coverMetaItem: {
    marginRight: 32,
    marginBottom: 8,
  },
  coverMetaLabel: {
    fontSize: 7,
    color: C.pale,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 3,
    fontFamily: 'Helvetica',
  },
  coverMetaValue: {
    fontSize: 10,
    color: C.light,
    fontFamily: 'Helvetica',
  },
  coverBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  coverDate: {
    fontSize: 8,
    color: '#4a7a58',
    letterSpacing: 1,
  },
  coverPage2Line: {
    fontSize: 8,
    color: '#4a7a58',
  },

  // Page padding
  pad: {
    padding: '36px 48px 56px',
  },

  // Page header bar
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 28,
  },
  pageHeaderBrand: {
    fontSize: 9,
    color: C.pale,
    letterSpacing: 2,
    fontFamily: 'Helvetica',
  },
  pageHeaderTitle: {
    fontSize: 8,
    color: C.muted,
    letterSpacing: 1,
  },

  // Section heading
  eyebrow: {
    fontSize: 7,
    color: C.muted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  h1: {
    fontSize: 26,
    fontFamily: 'Times-Roman',
    fontStyle: 'italic',
    color: C.dark,
    lineHeight: 1.3,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 17,
    fontFamily: 'Times-Roman',
    fontStyle: 'italic',
    color: C.dark,
    lineHeight: 1.25,
    marginBottom: 8,
  },
  body: {
    fontSize: 10,
    color: C.muted,
    lineHeight: 1.75,
    fontFamily: 'Helvetica',
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 0,
    backgroundColor: C.white,
  },
  statBox: {
    flex: 1,
    padding: '12px 14px',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  statBoxLast: {
    borderRightWidth: 0,
  },
  statVal: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    marginBottom: 3,
  },
  statLbl: {
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.muted,
  },

  // Feasibility box
  feasBox: {
    backgroundColor: C.amberBg,
    borderWidth: 1,
    borderColor: C.amberBorder,
    borderLeftWidth: 3,
    borderLeftColor: C.amber,
    borderRadius: 6,
    padding: '10px 14px',
    marginTop: 20,
  },
  feasLabel: {
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.amber,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  feasText: {
    fontSize: 9,
    color: '#7a4f0a',
    lineHeight: 1.6,
  },

  // Category header
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 14,
    marginTop: 24,
  },
  catName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    marginRight: 10,
  },
  catCount: {
    fontSize: 8,
    color: C.muted,
    backgroundColor: C.bg,
    padding: '2px 8px',
    borderRadius: 20,
  },

  // Plant cards — 2-up grid
  cardRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  plantCard: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  plantCardLast: {
    marginRight: 0,
  },
  plantCardSpacer: {
    flex: 1,
    marginRight: 0,
  },
  // Plant image
  plantImgWrap: {
    width: '100%',
    height: 100,
    overflow: 'hidden',
    backgroundColor: C.bg,
  },
  plantImg: {
    width: '100%',
    height: 100,
    objectFit: 'cover',
  },
  plantImgPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#e8f2e0',
  },
  plantCardBody: {
    padding: '10px 12px',
  },
  plantName: {
    fontSize: 13,
    fontFamily: 'Times-Roman',
    fontStyle: 'italic',
    color: C.dark,
    marginBottom: 2,
    lineHeight: 1.2,
  },
  plantSci: {
    fontSize: 8,
    color: C.pale,
    fontStyle: 'italic',
    marginBottom: 9,
  },
  specsRow: {
    flexDirection: 'row',
    marginBottom: 9,
  },
  specBox: {
    flex: 1,
    backgroundColor: C.bg,
    padding: '5px 7px',
    borderRadius: 5,
    marginRight: 5,
  },
  specBoxLast: {
    marginRight: 0,
  },
  specVal: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    marginBottom: 1,
  },
  specKey: {
    fontSize: 6.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.muted,
  },
  plantNote: {
    fontSize: 8.5,
    color: C.muted,
    lineHeight: 1.55,
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: '#eef2ea',
    paddingTop: 7,
  },

  // Hardscape
  hdCard: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  hdCardLast: { marginRight: 0 },
  hdSwatch: { height: 28, width: '100%' },
  hdCardBody: { padding: '10px 12px' },
  hdName: {
    fontSize: 12,
    fontFamily: 'Times-Roman',
    fontStyle: 'italic',
    color: C.dark,
    marginBottom: 2,
  },
  hdSub: { fontSize: 8, color: C.pale, fontStyle: 'italic', marginBottom: 9 },
  hdAttrsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  hdAttr: {
    width: '50%',
    backgroundColor: C.bg,
    padding: '5px 7px',
    borderRadius: 4,
    marginBottom: 5,
    marginRight: '0%',
  },
  hdAttrK: {
    fontSize: 6.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.muted,
    marginBottom: 1,
  },
  hdAttrV: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  hdNote: {
    fontSize: 8.5,
    color: C.muted,
    lineHeight: 1.55,
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: '#eef2ea',
    paddingTop: 7,
    marginTop: 3,
  },

  // Spec table
  tableWrap: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.dark,
    padding: '7px 10px',
  },
  tableRow: {
    flexDirection: 'row',
    padding: '5px 10px',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ea',
  },
  tableRowAlt: {
    backgroundColor: '#f7f9f5',
  },
  tableRowCatHdr: {
    backgroundColor: 'rgba(200,235,208,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    padding: '4px 10px',
  },
  thCell: {
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: C.cream,
    fontFamily: 'Helvetica-Bold',
  },
  tdCell: {
    fontSize: 8.5,
    color: C.muted,
    lineHeight: 1.4,
  },
  tdBold: {
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  tdItalic: {
    fontStyle: 'italic',
    color: C.pale,
  },
  tdCatLabel: {
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.dark,
    fontFamily: 'Helvetica-Bold',
  },

  // Page footer
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerBrand: {
    fontSize: 7,
    color: C.muted,
    letterSpacing: 1.5,
    fontFamily: 'Helvetica',
  },
  footerPage: {
    fontSize: 7,
    color: C.pale,
  },
})

// ── Helpers ────────────────────────────────────────────────────
function PageFooter({ project, pageNum }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.footerBrand}>LandPal.</Text>
      <Text style={s.footerPage}>{project}  ·  {pageNum}</Text>
    </View>
  )
}

function PageHdr({ brand = 'LandPal.', right = '' }) {
  return (
    <View style={s.pageHeader}>
      <Text style={s.pageHeaderBrand}>{brand}</Text>
      <Text style={s.pageHeaderTitle}>{right}</Text>
    </View>
  )
}

function PlantCardComp({ plant, imgSrc, last }) {
  const heightDisplay = plant.controllableHeight || plant.maxHeight || '—'
  const waterLabel = plant.water === 'Low' ? 'Low' : plant.water === 'High' ? 'High' : 'Moderate'
  const formDisplay = plant.form ? plant.form.split('/')[0].trim() : '—'

  return (
    <View style={[s.plantCard, last && s.plantCardLast]}>
      {/* Image or placeholder */}
      {imgSrc
        ? <Image src={imgSrc} style={s.plantImg} />
        : <View style={s.plantImgPlaceholder} />
      }
      <View style={s.plantCardBody}>
        <Text style={s.plantName}>{plant.commonName || '—'}</Text>
        {plant.scientificName ? <Text style={s.plantSci}>{plant.scientificName}</Text> : null}
        <View style={s.specsRow}>
          <View style={s.specBox}><Text style={s.specVal}>{heightDisplay}</Text><Text style={s.specKey}>Height</Text></View>
          <View style={s.specBox}><Text style={s.specVal}>{waterLabel}</Text><Text style={s.specKey}>Water</Text></View>
          <View style={[s.specBox, s.specBoxLast]}><Text style={s.specVal}>{formDisplay}</Text><Text style={s.specKey}>Form</Text></View>
        </View>
        {plant.note ? <Text style={s.plantNote}>{plant.note}</Text> : null}
      </View>
    </View>
  )
}

function HdCardComp({ mat, last }) {
  const swatchColor = mat.swatchHex || '#aaaaaa'
  const attrs = [
    mat.finish && { k: 'Finish', v: mat.finish },
    mat.size && { k: 'Size / Format', v: mat.size },
    mat.color && { k: 'Colour Tone', v: mat.color },
    mat.durability && { k: 'Durability', v: mat.durability },
    mat.maintenance && { k: 'Maintenance', v: mat.maintenance },
    mat.pattern && { k: 'Pattern', v: mat.pattern },
  ].filter(Boolean)

  return (
    <View style={[s.hdCard, last && s.hdCardLast]}>
      <View style={[s.hdSwatch, { backgroundColor: swatchColor }]} />
      <View style={s.hdCardBody}>
        <Text style={s.hdName}>{mat.name || '—'}</Text>
        {mat.subtype ? <Text style={s.hdSub}>{mat.subtype}</Text> : null}
        <View style={s.hdAttrsGrid}>
          {attrs.slice(0, 4).map((a, i) => (
            <View key={i} style={s.hdAttr}>
              <Text style={s.hdAttrK}>{a.k}</Text>
              <Text style={s.hdAttrV}>{a.v}</Text>
            </View>
          ))}
        </View>
        {mat.note ? <Text style={s.hdNote}>{mat.note}</Text> : null}
      </View>
    </View>
  )
}

// ── Main PDF document ──────────────────────────────────────────
function PalettePDF({ result, form, imageMap }) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const projectName = [
    form.region?.replace('__c:', '') || form.country,
    form.projectType,
  ].filter(Boolean).join('  ·  ')

  const hasSoft = !!(result.strategy || result.categories?.length)
  const hasHard = !!(result.hardscapeStrategy || result.hardscapeCategories?.length)
  const allPlants = (result.categories || []).flatMap(c => (c.plants || []).map(p => ({ ...p, _cat: c.name })))
  const totalPlants = allPlants.length
  const totalCats = (result.categories || []).length
  const totalZones = (result.hardscapeCategories || []).length

  const paletteLabel = form.paletteType === 'softscape' ? 'Softscape' : form.paletteType === 'hardscape' ? 'Hardscape' : 'Complete Palette'

  // Group plants into rows of 2
  function rows2(arr) {
    const out = []
    for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2))
    return out
  }

  return (
    <Document title={`LandPal — ${projectName}`} author="LandPal." creator="LandPal.">

      {/* ── PAGE 1: Cover ── */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverWrap}>
          <View style={s.coverTop}>
            <Text style={s.coverBrand}>LandPal.</Text>
            <Text style={s.coverTypeBadge}>{paletteLabel}</Text>
          </View>

          <View style={s.coverCenter}>
            <Text style={s.coverEyebrow}>Landscape Palette</Text>
            <Text style={s.coverTitle}>
              {form.region?.replace('__c:', '') || form.country || 'Your Project'}
              {'\n'}
              <Text style={{ fontStyle: 'italic', color: '#90c878' }}>
                {form.projectType || 'Landscape Design'}
              </Text>
            </Text>
            <View style={s.coverDivider} />
            <View style={s.coverMeta}>
              {form.country && (
                <View style={s.coverMetaItem}>
                  <Text style={s.coverMetaLabel}>Country</Text>
                  <Text style={s.coverMetaValue}>{form.country}</Text>
                </View>
              )}
              {form.style && (
                <View style={s.coverMetaItem}>
                  <Text style={s.coverMetaLabel}>Style</Text>
                  <Text style={s.coverMetaValue}>{form.style}</Text>
                </View>
              )}
              {hasSoft && totalPlants > 0 && (
                <View style={s.coverMetaItem}>
                  <Text style={s.coverMetaLabel}>Plants</Text>
                  <Text style={s.coverMetaValue}>{totalPlants} species</Text>
                </View>
              )}
              {hasHard && totalZones > 0 && (
                <View style={s.coverMetaItem}>
                  <Text style={s.coverMetaLabel}>Zones</Text>
                  <Text style={s.coverMetaValue}>{totalZones} defined</Text>
                </View>
              )}
            </View>
          </View>

          <View style={s.coverBottom}>
            <Text style={s.coverDate}>{today}</Text>
            <Text style={s.coverPage2Line}>Generated by LandPal.</Text>
          </View>
        </View>
      </Page>

      {/* ── PAGE 2: Strategy & Overview ── */}
      {(result.strategy || result.hardscapeStrategy) && (
        <Page size="A4" style={s.page}>
          <View style={s.pad}>
            <PageHdr right={projectName} />

            {hasSoft && result.strategy && (
              <View style={{ marginBottom: hasHard && result.hardscapeStrategy ? 32 : 0 }}>
                <Text style={s.eyebrow}>Design Strategy &amp; Rationale</Text>
                <Text style={s.h1}>Softscape Vision</Text>
                <Text style={s.body}>{result.strategy}</Text>
              </View>
            )}

            {hasHard && result.hardscapeStrategy && (
              <View style={{ marginTop: hasSoft && result.strategy ? 28 : 0 }}>
                <Text style={s.eyebrow}>Material Strategy &amp; Rationale</Text>
                <Text style={s.h1}>Hardscape Vision</Text>
                <Text style={s.body}>{result.hardscapeStrategy}</Text>
              </View>
            )}

            {result.feasibilityNotes && result.feasibilityNotes !== 'null' && (
              <View style={s.feasBox}>
                <Text style={s.feasLabel}>Feasibility Notes</Text>
                <Text style={s.feasText}>{result.feasibilityNotes}</Text>
              </View>
            )}

            {/* Stats */}
            <View style={s.statsBar}>
              {hasSoft && totalPlants > 0 && (
                <View style={s.statBox}>
                  <Text style={s.statVal}>{totalPlants}</Text>
                  <Text style={s.statLbl}>Plants</Text>
                </View>
              )}
              {hasSoft && totalCats > 0 && (
                <View style={s.statBox}>
                  <Text style={s.statVal}>{totalCats}</Text>
                  <Text style={s.statLbl}>Categories</Text>
                </View>
              )}
              {hasHard && totalZones > 0 && (
                <View style={[s.statBox, s.statBoxLast]}>
                  <Text style={s.statVal}>{totalZones}</Text>
                  <Text style={s.statLbl}>Zones</Text>
                </View>
              )}
            </View>
          </View>
        </Page>
      )}

      {/* ── PAGES: Softscape categories ── */}
      {hasSoft && (result.categories || []).map((cat, ci) => {
        const plants = cat.plants || []
        if (plants.length === 0) return null
        const plantRows = rows2(plants)

        return (
          <Page key={ci} size="A4" style={s.page}>
            <View style={s.pad}>
              <PageHdr right={projectName} />

              <Text style={s.eyebrow}>Softscape Palette</Text>
              <View style={s.catHeader}>
                <Text style={s.catName}>{cat.name}</Text>
                <Text style={s.catCount}>{plants.length} {plants.length === 1 ? 'species' : 'species'}</Text>
              </View>

              {plantRows.map((row, ri) => (
                <View key={ri} style={s.cardRow} wrap={false}>
                  {row.map((plant, pi) => (
                    <PlantCardComp
                      key={pi}
                      plant={plant}
                      imgSrc={imageMap[plant.scientificName] || null}
                      last={pi === row.length - 1}
                    />
                  ))}
                  {/* Spacer if odd number */}
                  {row.length === 1 && <View style={s.plantCardSpacer} />}
                </View>
              ))}
            </View>
          </Page>
        )
      })}

      {/* ── PAGES: Hardscape zones ── */}
      {hasHard && (result.hardscapeCategories || []).map((zone, zi) => {
        const mats = zone.materials || []
        if (mats.length === 0) return null
        const matRows = rows2(mats)

        return (
          <Page key={zi} size="A4" style={s.page}>
            <View style={s.pad}>
              <PageHdr right={projectName} />

              <Text style={s.eyebrow}>Hardscape Palette</Text>
              <View style={s.catHeader}>
                <Text style={s.catName}>{zone.zone || zone.name || `Zone ${zi + 1}`}</Text>
                <Text style={s.catCount}>{mats.length} {mats.length === 1 ? 'material' : 'materials'}</Text>
              </View>

              {matRows.map((row, ri) => (
                <View key={ri} style={s.cardRow} wrap={false}>
                  {row.map((mat, mi) => (
                    <HdCardComp
                      key={mi}
                      mat={mat}
                      last={mi === row.length - 1}
                    />
                  ))}
                  {row.length === 1 && <View style={[s.hdCard, { backgroundColor: 'transparent', borderColor: 'transparent' }]} />}
                </View>
              ))}
            </View>
          </Page>
        )
      })}

      {/* ── LAST PAGE: Full Spec Table ── */}
      {hasSoft && allPlants.length > 0 && (
        <Page size="A4" style={s.page} orientation="landscape">
          <View style={{ padding: '36px 40px 56px' }}>
            <PageHdr right={projectName} />
            <Text style={s.eyebrow}>Full Specification Table</Text>
            <Text style={[s.h2, { marginBottom: 16 }]}>Plant Specifications</Text>

            <View style={s.tableWrap}>
              {/* Header */}
              <View style={s.tableHead}>
                {[
                  { label: 'Common Name',     w: '16%' },
                  { label: 'Botanical Name',  w: '17%' },
                  { label: 'Category',        w: '12%' },
                  { label: 'Type',            w: '9%'  },
                  { label: 'Max Height',      w: '9%'  },
                  { label: 'Spread',          w: '8%'  },
                  { label: 'Water',           w: '7%'  },
                  { label: 'Form',            w: '10%' },
                  { label: 'Root Depth',      w: '8%'  },
                  { label: 'Notes',           w: '14%' },
                ].map((col, i) => (
                  <Text key={i} style={[s.thCell, { width: col.w }]}>{col.label}</Text>
                ))}
              </View>

              {/* Rows — grouped by category */}
              {(result.categories || []).map((cat, ci) =>
                [
                  // Category sub-header row
                  <View key={`cat-${ci}`} style={s.tableRowCatHdr}>
                    <Text style={s.tdCatLabel}>{cat.name}</Text>
                  </View>,
                  // Plant rows
                  ...(cat.plants || []).map((p, pi) => (
                    <View key={`p-${ci}-${pi}`} style={[s.tableRow, pi % 2 === 1 && s.tableRowAlt]}>
                      <Text style={[s.tdCell, s.tdBold,   { width: '16%' }]}>{p.commonName || '—'}</Text>
                      <Text style={[s.tdCell, s.tdItalic, { width: '17%' }]}>{p.scientificName || '—'}</Text>
                      <Text style={[s.tdCell,             { width: '12%' }]}>{cat.name}</Text>
                      <Text style={[s.tdCell,             { width: '9%'  }]}>{p.type || '—'}</Text>
                      <Text style={[s.tdCell,             { width: '9%'  }]}>{p.controllableHeight || p.maxHeight || '—'}</Text>
                      <Text style={[s.tdCell,             { width: '8%'  }]}>{p.spread || '—'}</Text>
                      <Text style={[s.tdCell,             { width: '7%'  }]}>{p.water || '—'}</Text>
                      <Text style={[s.tdCell,             { width: '10%' }]}>{p.form || '—'}</Text>
                      <Text style={[s.tdCell,             { width: '8%'  }]}>{p.rootDepth || '—'}</Text>
                      <Text style={[s.tdCell,             { width: '14%' }]} numberOfLines={3}>{p.note || '—'}</Text>
                    </View>
                  )),
                ]
              )}
            </View>
          </View>
        </Page>
      )}

    </Document>
  )
}

// ── Export function ────────────────────────────────────────────
export async function exportToPdf(result, form, onProgress) {
  const projectName = [
    form.region?.replace('__c:', '') || form.country,
    form.projectType,
  ].filter(Boolean).join(' — ')

  // Step 1 — fetch all plant images in parallel
  onProgress?.('Fetching plant images…')
  const imageMap = await buildImageMap(result)

  // Step 2 — build & render PDF
  onProgress?.('Building PDF…')
  const doc = <PalettePDF result={result} form={form} imageMap={imageMap} />
  const blob = await pdf(doc).toBlob()

  // Step 3 — trigger download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `LandPal — ${projectName}.pdf`
  a.click()
  URL.revokeObjectURL(url)
  onProgress?.(null)
}
