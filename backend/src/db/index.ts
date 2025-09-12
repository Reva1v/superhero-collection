import {db} from "./db";
import {NewSuperhero, superheroes, superheroImages, NewSuperheroImage} from "./schema.ts";
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function processAndSaveImage(imagePath: string, heroId: number, imageIndex: number): Promise<string> {
    const uploadDir = 'uploads/superheroes';

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {recursive: true});
    }

    const filename = `hero-${heroId}-${Date.now()}-${imageIndex}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(imagePath)
        .resize(800, 600, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({quality: 85})
        .toFile(outputPath);

    return `/uploads/superheroes/${filename}`;
}

async function main() {
    try {
        const superheroesData = [
            {
                hero: {
                    nickname: "Superman",
                    realName: "Clark Kent",
                    originDescription: "Born Kal-El on the planet Krypton, rocketed to Earth as an infant by his scientist father Jor-El moments before Krypton's destruction. Raised by Jonathan and Martha Kent in Smallville, Kansas.",
                    superpowers: "Solar energy absorption, super strength, flight, heat vision, x-ray vision, super speed, invulnerability, freeze breath",
                    catchPhrase: "Look, up in the sky, it's a bird, it's a plane, it's Superman!"
                },
                images: [
                    "https://images.unsplash.com/photo-1590341328520-63256eb32bc3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                ]
            },
            {
                hero: {
                    nickname: "Batman",
                    realName: "Bruce Wayne",
                    originDescription: "Witnessed his parents' murder as a child in Crime Alley. Dedicated his life to fighting crime and trained extensively in martial arts, detective skills, and technology.",
                    superpowers: "Genius-level intellect, martial arts mastery, advanced technology, stealth, detective skills, vast wealth",
                    catchPhrase: "I am Batman!"
                },
                images: [
                    "src/images/batman-1.jpg",
                    "src/images/batman-2.jpg",
                    "src/images/batman-3.jpg"
                ]
            },
            {
                hero: {
                    nickname: "Wonder Woman",
                    realName: "Diana Prince",
                    originDescription: "Amazonian princess from the island of Themyscira, daughter of Queen Hippolyta. Gifted with powers by the Greek gods to protect mankind.",
                    superpowers: "Super strength, flight, lasso of truth, bulletproof bracelets, enhanced speed and agility, warrior training",
                    catchPhrase: "Great Hera! By the gods of Olympus!"
                },
                images: []
            },
            {
                hero: {
                    nickname: "Spider-Man",
                    realName: "Peter Parker",
                    originDescription: "Teenager bitten by a radioactive spider during a school field trip. Learned that with great power comes great responsibility.",
                    superpowers: "Wall-crawling, spider-sense, super strength, agility, web-shooting, enhanced reflexes",
                    catchPhrase: "With great power comes great responsibility!"
                },
                images: [
                    "src/images/spudi-1.jpg",
                    "src/images/spudi-2.jpg"
                ]
            },
            {
                hero: {
                    nickname: "Deadpool",
                    realName: "Wade Wilson",
                    originDescription: "A former Canadian Special Forces operative turned mercenary, Wade Wilson was diagnosed with terminal cancer. In a desperate attempt to cure himself, he volunteered for the Weapon X program, where experiments gave him a superhuman healing factor based on Wolverine's DNA. Though the process cured his cancer and granted him regenerative abilities, it left his body heavily scarred and his mind unstable. Emerging as the unpredictable antihero Deadpool, he's known for his dark humor, breaking the fourth wall, and unmatched combat skills.",
                    superpowers: "Regenerative healing factor, superhuman agility, master martial artist, expert marksman, rapid cellular regeneration, immunity to disease, resistance to telepathy",
                    catchPhrase: "Chimichangas! Maximum effort!"
                },
                images: [
                    "src/images/deadpool-1.jpg",
                    "src/images/deadpool-2.jpg"
                ]
            },
            {
                hero: {
                    nickname: "Aquaman",
                    realName: "Arthur Curry",
                    originDescription: "Half-human, half-Atlantean, rightful king of the underwater kingdom of Atlantis. Born to lighthouse keeper and Atlantean queen.",
                    superpowers: "Underwater breathing, telepathic communication with sea life, super strength, durability, trident mastery, hydrokinesis",
                    catchPhrase: "By the power of the seas!"
                },
                images: []
            },
            {
                hero: {
                    nickname: "Thor",
                    realName: "Thor Odinson",
                    originDescription: "God of Thunder from Asgard, one of the Nine Realms. Wielder of the mystical hammer Mjolnir, protector of Earth and Asgard.",
                    superpowers: "God-like strength, flight, weather control, Mjolnir mastery, immortality, lightning manipulation",
                    catchPhrase: "For Asgard! By Odin's beard!"
                },
                images: [
                    "src/images/thor-1.jpg",
                    "src/images/thor-2.jpg"
                ]
            },
            {
                hero: {
                    nickname: "Iron Man",
                    realName: "Tony Stark",
                    originDescription: "Genius billionaire inventor who built a powered suit of armor to escape captivity and later used it to protect the world.",
                    superpowers: "Powered armor suit, genius intellect, advanced technology, flight, repulsors, vast wealth",
                    catchPhrase: "I am Iron Man!"
                },
                images: [
                    "https://images.unsplash.com/photo-1626278664285-f796b9ee7806?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                ]
            },
            {
                hero: {
                    nickname: "Wolverine",
                    realName: "Logan",
                    originDescription: "Mutant with healing factor and retractable claws, subjected to experiments that bonded adamantium to his skeleton.",
                    superpowers: "Regenerative healing, adamantium claws and skeleton, enhanced senses, longevity, combat expertise",
                    catchPhrase: "I'm the best there is at what I do, but what I do best isn't very nice."
                },
                images: [
                    "src/images/wolverine-1.jpg"
                ]
            }
        ];

        console.log('🚀 Adding superheroes with images to the database...');

        for (const {hero, images} of superheroesData) {
            try {
                const [insertedHero] = await db.insert(superheroes).values(hero).returning();
                console.log(`✅ Added hero: ${insertedHero.nickname} (ID: ${insertedHero.id})`);

                const imageRecords: NewSuperheroImage[] = [];

                for (let i = 0; i < images.length; i++) {
                    const imagePath = images[i];
                    let finalImageUrl = imagePath;

                    try {
                        if (imagePath.startsWith('http')) {
                            imageRecords.push({
                                superheroId: insertedHero.id,
                                imageUrl: imagePath,
                                imageType: 'url',
                                altText: `${insertedHero.nickname} image ${i + 1}`
                            });
                            console.log(`   📷 Added URL image: ${imagePath}`);
                        } else {
                            if (fs.existsSync(imagePath)) {
                                const processedImageUrl = await processAndSaveImage(imagePath, insertedHero.id, i);
                                imageRecords.push({
                                    superheroId: insertedHero.id,
                                    imageUrl: processedImageUrl,
                                    imageType: 'upload',
                                    altText: `${insertedHero.nickname} image ${i + 1}`
                                });
                                console.log(`   📷 Processed and saved: ${processedImageUrl}`);
                            } else {
                                console.warn(`   ⚠️  Image file not found: ${imagePath}`);
                            }
                        }
                    } catch (imageError) {
                        console.error(`   ❌ Error processing image ${imagePath}:`, imageError);
                    }
                }

                if (imageRecords.length > 0) {
                    await db.insert(superheroImages).values(imageRecords);
                    console.log(`   🖼️  Added ${imageRecords.length} images to database`);
                }

                console.log('');
            } catch (heroError) {
                console.error(`❌ Error adding hero ${hero.nickname}:`, heroError);
            }
        }

        const allHeroes = await db.select().from(superheroes);
        const allImages = await db.select().from(superheroImages);

        console.log(`\n📊 Final Statistics:`);
        console.log(`   🦸‍♂️ Total heroes: ${allHeroes.length}`);
        console.log(`   🖼️  Total images: ${allImages.length}`);

        console.log(`\n🎉 Database seeding completed successfully!`);

    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
}

main().catch(console.error);
