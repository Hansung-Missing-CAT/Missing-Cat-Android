import sharp from 'sharp'
import { writeFileSync } from 'fs'

// 빨간 배경 + 흰색 발바닥 아이콘 SVG (512x512 기준)
const SOURCE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- 배경 -->
  <rect width="512" height="512" rx="96" fill="#D32F2F"/>
  <!-- 발바닥 메인 패드 -->
  <ellipse cx="256" cy="310" rx="90" ry="80" fill="white"/>
  <!-- 발가락 4개 -->
  <ellipse cx="150" cy="210" rx="42" ry="50" fill="white"/>
  <ellipse cx="215" cy="175" rx="42" ry="50" fill="white"/>
  <ellipse cx="297" cy="175" rx="42" ry="50" fill="white"/>
  <ellipse cx="362" cy="210" rx="42" ry="50" fill="white"/>
</svg>`

const svgBuffer = Buffer.from(SOURCE_SVG)

await sharp(svgBuffer).resize(192, 192).png().toFile('public/pwa-192x192.png')
console.log('✓ pwa-192x192.png')

await sharp(svgBuffer).resize(512, 512).png().toFile('public/pwa-512x512.png')
console.log('✓ pwa-512x512.png')

await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png')
console.log('✓ apple-touch-icon.png')

// mask-icon.svg — Safari 핀탭용 단색 SVG (색상 없이 모양만)
const MASK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <ellipse cx="256" cy="310" rx="90" ry="80"/>
  <ellipse cx="150" cy="210" rx="42" ry="50"/>
  <ellipse cx="215" cy="175" rx="42" ry="50"/>
  <ellipse cx="297" cy="175" rx="42" ry="50"/>
  <ellipse cx="362" cy="210" rx="42" ry="50"/>
</svg>`
writeFileSync('public/mask-icon.svg', MASK_SVG)
console.log('✓ mask-icon.svg')

console.log('\n아이콘 생성 완료!')
