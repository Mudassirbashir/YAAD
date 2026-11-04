-- YAAD catalog data fix (2026-11-05). Run ONCE in Supabase SQL Editor. Idempotent.
-- Part 1: fix doubled brand names
UPDATE public.items SET canonical_name='Weetabix Original', english_name='Weetabix Original', updated_at=now() WHERE id='imp_weetabix-weetabix-original';
UPDATE public.items SET canonical_name='Vital Tea 950g', english_name='Vital Tea 950g', updated_at=now() WHERE id='imp_vital-vital-tea';
UPDATE public.items SET canonical_name='Oreo Original', english_name='Oreo Original', updated_at=now() WHERE id='imp_oreo-oreo-original';
UPDATE public.items SET canonical_name='Aquafina 500ml', english_name='Aquafina 500ml', updated_at=now() WHERE id='imp_aquafina-aquafina';
UPDATE public.items SET canonical_name='Gourmet Water 500ml', english_name='Gourmet Water 500ml', updated_at=now() WHERE id='imp_gourmet-gourmet-water';
UPDATE public.items SET canonical_name='Kinley 500ml', english_name='Kinley 500ml', updated_at=now() WHERE id='imp_kinley-kinley';
UPDATE public.items SET canonical_name='Euro Cake', english_name='Euro Cake', updated_at=now() WHERE id='imp_euro-cake-euro-cake';
UPDATE public.items SET canonical_name='Chupa Chups', english_name='Chupa Chups', updated_at=now() WHERE id='imp_chupa-chups-chupa-chups';
UPDATE public.items SET canonical_name='Ferrero Rocher', english_name='Ferrero Rocher', updated_at=now() WHERE id='imp_ferrero-ferrero-rocher';
UPDATE public.items SET canonical_name='Mentos Mint', english_name='Mentos Mint', updated_at=now() WHERE id='imp_mentos-mentos-mint';
UPDATE public.items SET canonical_name='Toblerone', english_name='Toblerone', updated_at=now() WHERE id='imp_toblerone-toblerone';
UPDATE public.items SET canonical_name='Red Bull 250ml', english_name='Red Bull 250ml', updated_at=now() WHERE id='imp_red-bull-red-bull';
UPDATE public.items SET canonical_name='Sting', english_name='Sting', updated_at=now() WHERE id='imp_sting-sting';
UPDATE public.items SET canonical_name='Slice Mango', english_name='Slice Mango', updated_at=now() WHERE id='imp_slice-slice-mango';
UPDATE public.items SET canonical_name='Tang Mango', english_name='Tang Mango', updated_at=now() WHERE id='imp_tang-tang-mango';
UPDATE public.items SET canonical_name='Tang Orange', english_name='Tang Orange', updated_at=now() WHERE id='imp_tang-tang-orange';
UPDATE public.items SET canonical_name='Tropicana Orange', english_name='Tropicana Orange', updated_at=now() WHERE id='imp_tropicana-tropicana-orange';
UPDATE public.items SET canonical_name='7UP 500ml', english_name='7UP 500ml', updated_at=now() WHERE id='imp_7up-7up';
UPDATE public.items SET canonical_name='Coca-Cola Classic 500ml', english_name='Coca-Cola Classic 500ml', updated_at=now() WHERE id='imp_coca-cola-coca-cola-classic';
UPDATE public.items SET canonical_name='Coca-Cola Zero 500ml', english_name='Coca-Cola Zero 500ml', updated_at=now() WHERE id='imp_coca-cola-coca-cola-zero';
UPDATE public.items SET canonical_name='Fanta Orange 500ml', english_name='Fanta Orange 500ml', updated_at=now() WHERE id='imp_fanta-fanta-orange';
UPDATE public.items SET canonical_name='Gourmet Cola', english_name='Gourmet Cola', updated_at=now() WHERE id='imp_gourmet-gourmet-cola';
UPDATE public.items SET canonical_name='Mirinda Orange 500ml', english_name='Mirinda Orange 500ml', updated_at=now() WHERE id='imp_mirinda-mirinda-orange';
UPDATE public.items SET canonical_name='Mountain Dew 500ml', english_name='Mountain Dew 500ml', updated_at=now() WHERE id='imp_mountain-dew-mountain-dew';
UPDATE public.items SET canonical_name='Next Cola 345ml', english_name='Next Cola 345ml', updated_at=now() WHERE id='imp_next-cola-next-cola';
UPDATE public.items SET canonical_name='Pakola Ice Cream Soda', english_name='Pakola Ice Cream Soda', updated_at=now() WHERE id='imp_pakola-pakola-ice-cream-soda';
UPDATE public.items SET canonical_name='Pepsi 500ml', english_name='Pepsi 500ml', updated_at=now() WHERE id='imp_pepsi-pepsi';
UPDATE public.items SET canonical_name='Sprite 500ml', english_name='Sprite 500ml', updated_at=now() WHERE id='imp_sprite-sprite';
UPDATE public.items SET canonical_name='Milo', english_name='Milo', updated_at=now() WHERE id='imp_milo-milo';
UPDATE public.items SET canonical_name='Supreme Tea', english_name='Supreme Tea', updated_at=now() WHERE id='imp_supreme-supreme-tea';
UPDATE public.items SET canonical_name='Canbebe Baby Diapers', english_name='Canbebe Baby Diapers', updated_at=now() WHERE id='imp_canbebe-canbebe-baby-diapers';
UPDATE public.items SET canonical_name='Johnson''s Baby Cream', english_name='Johnson''s Baby Cream', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-cream';
UPDATE public.items SET canonical_name='Johnson''s Baby Lotion', english_name='Johnson''s Baby Lotion', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-lotion';
UPDATE public.items SET canonical_name='Johnson''s Baby Oil', english_name='Johnson''s Baby Oil', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-oil';
UPDATE public.items SET canonical_name='Johnson''s Baby Powder', english_name='Johnson''s Baby Powder', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-powder';
UPDATE public.items SET canonical_name='Johnson''s Baby Shampoo', english_name='Johnson''s Baby Shampoo', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-shampoo';
UPDATE public.items SET canonical_name='Johnson''s Baby Soap', english_name='Johnson''s Baby Soap', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-soap';
UPDATE public.items SET canonical_name='Johnson''s Baby Wipes', english_name='Johnson''s Baby Wipes', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-wipes';
UPDATE public.items SET canonical_name='Molfix Baby Diapers', english_name='Molfix Baby Diapers', updated_at=now() WHERE id='imp_molfix-molfix-baby-diapers';
UPDATE public.items SET canonical_name='Molfix Baby Pants', english_name='Molfix Baby Pants', updated_at=now() WHERE id='imp_molfix-molfix-baby-pants';
UPDATE public.items SET canonical_name='Pampers Active Baby Diapers', english_name='Pampers Active Baby Diapers', updated_at=now() WHERE id='imp_pampers-pampers-active-baby-diapers';
UPDATE public.items SET canonical_name='Pampers Premium Care Diapers', english_name='Pampers Premium Care Diapers', updated_at=now() WHERE id='imp_pampers-pampers-premium-care-diapers';
UPDATE public.items SET canonical_name='Medora Lipstick', english_name='Medora Lipstick', updated_at=now() WHERE id='imp_medora-medora-lipstick';
UPDATE public.items SET canonical_name='Medora Nail Polish', english_name='Medora Nail Polish', updated_at=now() WHERE id='imp_medora-medora-nail-polish';
UPDATE public.items SET canonical_name='Axe Apollo Body Spray 150ml', english_name='Axe Apollo Body Spray 150ml', updated_at=now() WHERE id='imp_axe-axe-apollo-body-spray';
UPDATE public.items SET canonical_name='Axe Dark Temptation Body Spray 150ml', english_name='Axe Dark Temptation Body Spray 150ml', updated_at=now() WHERE id='imp_axe-axe-dark-temptation-body-spray';
UPDATE public.items SET canonical_name='Axe Ice Chill Body Spray 150ml', english_name='Axe Ice Chill Body Spray 150ml', updated_at=now() WHERE id='imp_axe-axe-ice-chill-body-spray';
UPDATE public.items SET canonical_name='Lemon Max Dishwash Bar 290g', english_name='Lemon Max Dishwash Bar 290g', updated_at=now() WHERE id='imp_lemon-max-lemon-max-dishwash-bar';
UPDATE public.items SET canonical_name='Lemon Max Dishwash Liquid', english_name='Lemon Max Dishwash Liquid', updated_at=now() WHERE id='imp_lemon-max-lemon-max-dishwash-liquid';
UPDATE public.items SET canonical_name='Vim Dishwash Bar', english_name='Vim Dishwash Bar', updated_at=now() WHERE id='imp_vim-vim-dishwash-bar';
UPDATE public.items SET canonical_name='Vim Dishwash Liquid Lemon', english_name='Vim Dishwash Liquid Lemon', updated_at=now() WHERE id='imp_vim-vim-dishwash-liquid-lemon';
UPDATE public.items SET canonical_name='Always Sanitary Pads', english_name='Always Sanitary Pads', updated_at=now() WHERE id='imp_always-always-sanitary-pads';
UPDATE public.items SET canonical_name='Dabur Amla Hair Oil', english_name='Dabur Amla Hair Oil', updated_at=now() WHERE id='imp_dabur-dabur-amla-hair-oil';
UPDATE public.items SET canonical_name='Dove Hair Fall Rescue Conditioner', english_name='Dove Hair Fall Rescue Conditioner', updated_at=now() WHERE id='imp_dove-dove-hair-fall-rescue-conditioner';
UPDATE public.items SET canonical_name='Dove Intense Repair Conditioner', english_name='Dove Intense Repair Conditioner', updated_at=now() WHERE id='imp_dove-dove-intense-repair-conditioner';
UPDATE public.items SET canonical_name='Hemani Black Seed Oil', english_name='Hemani Black Seed Oil', updated_at=now() WHERE id='imp_hemani-hemani-black-seed-oil';
UPDATE public.items SET canonical_name='Hemani Coconut Oil', english_name='Hemani Coconut Oil', updated_at=now() WHERE id='imp_hemani-hemani-coconut-oil';
UPDATE public.items SET canonical_name='TRESemmé Colour Revitalise Conditioner 160ml', english_name='TRESemmé Colour Revitalise Conditioner 160ml', updated_at=now() WHERE id='imp_tresemm-tresemm-colour-revitalise-conditioner';
UPDATE public.items SET canonical_name='TRESemmé Keratin Smooth & Straight Conditioner 160ml', english_name='TRESemmé Keratin Smooth & Straight Conditioner 160ml', updated_at=now() WHERE id='imp_tresemm-tresemm-keratin-smooth-straight-conditio';
UPDATE public.items SET canonical_name='TRESemmé Keratin Smooth Hair Mask 250ml', english_name='TRESemmé Keratin Smooth Hair Mask 250ml', updated_at=now() WHERE id='imp_tresemm-tresemm-keratin-smooth-hair-mask';
UPDATE public.items SET canonical_name='TRESemmé Keratin Smooth Serum 100ml', english_name='TRESemmé Keratin Smooth Serum 100ml', updated_at=now() WHERE id='imp_tresemm-tresemm-keratin-smooth-serum';
UPDATE public.items SET canonical_name='Veet Hair Removal Cream Normal Skin', english_name='Veet Hair Removal Cream Normal Skin', updated_at=now() WHERE id='imp_veet-veet-hair-removal-cream-normal-skin';
UPDATE public.items SET canonical_name='Veet Hair Removal Cream Sensitive Skin', english_name='Veet Hair Removal Cream Sensitive Skin', updated_at=now() WHERE id='imp_veet-veet-hair-removal-cream-sensitive-skin';
UPDATE public.items SET canonical_name='Dettol Cool Liquid Handwash 200ml', english_name='Dettol Cool Liquid Handwash 200ml', updated_at=now() WHERE id='imp_dettol-dettol-cool-liquid-handwash';
UPDATE public.items SET canonical_name='Dettol Original Liquid Handwash 200ml', english_name='Dettol Original Liquid Handwash 200ml', updated_at=now() WHERE id='imp_dettol-dettol-original-liquid-handwash';
UPDATE public.items SET canonical_name='Dettol Skincare Liquid Handwash 200ml', english_name='Dettol Skincare Liquid Handwash 200ml', updated_at=now() WHERE id='imp_dettol-dettol-skincare-liquid-handwash';
UPDATE public.items SET canonical_name='Lifebuoy Care Handwash 200ml', english_name='Lifebuoy Care Handwash 200ml', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-care-handwash';
UPDATE public.items SET canonical_name='Lifebuoy Lemon Fresh Handwash 200ml', english_name='Lifebuoy Lemon Fresh Handwash 200ml', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-lemon-fresh-handwash';
UPDATE public.items SET canonical_name='Lifebuoy Total 10 Handwash 200ml', english_name='Lifebuoy Total 10 Handwash 200ml', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-total-10-handwash';
UPDATE public.items SET canonical_name='Safeguard Liquid Handwash 200ml', english_name='Safeguard Liquid Handwash 200ml', updated_at=now() WHERE id='imp_safeguard-safeguard-liquid-handwash';
UPDATE public.items SET canonical_name='Mortein All Insect Killer Spray', english_name='Mortein All Insect Killer Spray', updated_at=now() WHERE id='imp_mortein-mortein-all-insect-killer-spray';
UPDATE public.items SET canonical_name='Mortein Mosquito Repellent Mats', english_name='Mortein Mosquito Repellent Mats', updated_at=now() WHERE id='imp_mortein-mortein-mosquito-repellent-mats';
UPDATE public.items SET canonical_name='Mortein PowerGard Mosquito Coils', english_name='Mortein PowerGard Mosquito Coils', updated_at=now() WHERE id='imp_mortein-mortein-powergard-mosquito-coils';
UPDATE public.items SET canonical_name='Ariel Complete Detergent Powder 1kg', english_name='Ariel Complete Detergent Powder 1kg', updated_at=now() WHERE id='imp_ariel-ariel-complete-detergent-powder';
UPDATE public.items SET canonical_name='Ariel Matic Front Load Detergent 1kg', english_name='Ariel Matic Front Load Detergent 1kg', updated_at=now() WHERE id='imp_ariel-ariel-matic-front-load-detergent';
UPDATE public.items SET canonical_name='Ariel Matic Top Load Detergent 1kg', english_name='Ariel Matic Top Load Detergent 1kg', updated_at=now() WHERE id='imp_ariel-ariel-matic-top-load-detergent';
UPDATE public.items SET canonical_name='Bonus Detergent Powder 1kg', english_name='Bonus Detergent Powder 1kg', updated_at=now() WHERE id='imp_bonus-bonus-detergent-powder';
UPDATE public.items SET canonical_name='Brite Detergent Powder 1kg', english_name='Brite Detergent Powder 1kg', updated_at=now() WHERE id='imp_brite-brite-detergent-powder';
UPDATE public.items SET canonical_name='Comfort Morning Fresh Fabric Conditioner 500ml', english_name='Comfort Morning Fresh Fabric Conditioner 500ml', updated_at=now() WHERE id='imp_comfort-comfort-morning-fresh-fabric-conditioner';
UPDATE public.items SET canonical_name='Rin Detergent Bar', english_name='Rin Detergent Bar', updated_at=now() WHERE id='imp_rin-rin-detergent-bar';
UPDATE public.items SET canonical_name='Surf Excel Easy Wash Detergent Powder 1kg', english_name='Surf Excel Easy Wash Detergent Powder 1kg', updated_at=now() WHERE id='imp_surf-excel-surf-excel-easy-wash-detergent-powder';
UPDATE public.items SET canonical_name='Surf Excel Matic Front Load Detergent 1kg', english_name='Surf Excel Matic Front Load Detergent 1kg', updated_at=now() WHERE id='imp_surf-excel-surf-excel-matic-front-load-detergent';
UPDATE public.items SET canonical_name='Surf Excel Matic Top Load Detergent 1kg', english_name='Surf Excel Matic Top Load Detergent 1kg', updated_at=now() WHERE id='imp_surf-excel-surf-excel-matic-top-load-detergent';
UPDATE public.items SET canonical_name='Clear Complete Active Care Shampoo', english_name='Clear Complete Active Care Shampoo', updated_at=now() WHERE id='imp_clear-clear-complete-active-care-shampoo';
UPDATE public.items SET canonical_name='Clear Cool Sport Menthol Shampoo', english_name='Clear Cool Sport Menthol Shampoo', updated_at=now() WHERE id='imp_clear-clear-cool-sport-menthol-shampoo';
UPDATE public.items SET canonical_name='Clear Men Cool Sport Menthol Shampoo', english_name='Clear Men Cool Sport Menthol Shampoo', updated_at=now() WHERE id='imp_clear-clear-men-cool-sport-menthol-shampoo';
UPDATE public.items SET canonical_name='Clear Men Deep Cleanse Shampoo', english_name='Clear Men Deep Cleanse Shampoo', updated_at=now() WHERE id='imp_clear-clear-men-deep-cleanse-shampoo';
UPDATE public.items SET canonical_name='Dove Daily Shine Shampoo', english_name='Dove Daily Shine Shampoo', updated_at=now() WHERE id='imp_dove-dove-daily-shine-shampoo';
UPDATE public.items SET canonical_name='Dove Hair Fall Rescue Shampoo', english_name='Dove Hair Fall Rescue Shampoo', updated_at=now() WHERE id='imp_dove-dove-hair-fall-rescue-shampoo';
UPDATE public.items SET canonical_name='Dove Intense Repair Shampoo', english_name='Dove Intense Repair Shampoo', updated_at=now() WHERE id='imp_dove-dove-intense-repair-shampoo';
UPDATE public.items SET canonical_name='Head & Shoulders Anti-Hairfall Shampoo', english_name='Head & Shoulders Anti-Hairfall Shampoo', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-anti-hairfall-sham';
UPDATE public.items SET canonical_name='Head & Shoulders Apple Fresh Shampoo', english_name='Head & Shoulders Apple Fresh Shampoo', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-apple-fresh-shampo';
UPDATE public.items SET canonical_name='Head & Shoulders Cool Menthol Shampoo', english_name='Head & Shoulders Cool Menthol Shampoo', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-cool-menthol-shamp';
UPDATE public.items SET canonical_name='Head & Shoulders Lemon Fresh Shampoo', english_name='Head & Shoulders Lemon Fresh Shampoo', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-lemon-fresh-shampo';
UPDATE public.items SET canonical_name='Head & Shoulders Smooth & Silky Shampoo', english_name='Head & Shoulders Smooth & Silky Shampoo', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-smooth-silky-shamp';
UPDATE public.items SET canonical_name='Pantene Pro-V Hair Fall Control Shampoo', english_name='Pantene Pro-V Hair Fall Control Shampoo', updated_at=now() WHERE id='imp_pantene-pantene-pro-v-hair-fall-control-shampoo';
UPDATE public.items SET canonical_name='Pantene Pro-V Silky Smooth Care Shampoo', english_name='Pantene Pro-V Silky Smooth Care Shampoo', updated_at=now() WHERE id='imp_pantene-pantene-pro-v-silky-smooth-care-shampoo';
UPDATE public.items SET canonical_name='Pantene Pro-V Total Damage Care Shampoo', english_name='Pantene Pro-V Total Damage Care Shampoo', updated_at=now() WHERE id='imp_pantene-pantene-pro-v-total-damage-care-shampoo';
UPDATE public.items SET canonical_name='Sunsilk Anti-Dandruff Shampoo', english_name='Sunsilk Anti-Dandruff Shampoo', updated_at=now() WHERE id='imp_sunsilk-sunsilk-anti-dandruff-shampoo';
UPDATE public.items SET canonical_name='Sunsilk Black Shine Shampoo', english_name='Sunsilk Black Shine Shampoo', updated_at=now() WHERE id='imp_sunsilk-sunsilk-black-shine-shampoo';
UPDATE public.items SET canonical_name='Sunsilk Long & Healthy Growth Shampoo', english_name='Sunsilk Long & Healthy Growth Shampoo', updated_at=now() WHERE id='imp_sunsilk-sunsilk-long-healthy-growth-shampoo';
UPDATE public.items SET canonical_name='Sunsilk Perfect Straight Shampoo', english_name='Sunsilk Perfect Straight Shampoo', updated_at=now() WHERE id='imp_sunsilk-sunsilk-perfect-straight-shampoo';
UPDATE public.items SET canonical_name='Sunsilk Thick & Long Shampoo', english_name='Sunsilk Thick & Long Shampoo', updated_at=now() WHERE id='imp_sunsilk-sunsilk-thick-long-shampoo';
UPDATE public.items SET canonical_name='TRESemmé Biotin Repair Shampoo 170ml', english_name='TRESemmé Biotin Repair Shampoo 170ml', updated_at=now() WHERE id='imp_tresemm-tresemm-biotin-repair-shampoo';
UPDATE public.items SET canonical_name='TRESemmé Bondplex Sleek And Repair Shampoo 170ml', english_name='TRESemmé Bondplex Sleek And Repair Shampoo 170ml', updated_at=now() WHERE id='imp_tresemm-tresemm-bondplex-sleek-and-repair-shampo';
UPDATE public.items SET canonical_name='TRESemmé Botanique Nourish And Replenish Shampoo 170ml', english_name='TRESemmé Botanique Nourish And Replenish Shampoo 170ml', updated_at=now() WHERE id='imp_tresemm-tresemm-botanique-nourish-and-replenish-';
UPDATE public.items SET canonical_name='TRESemmé Colour Revitalise Shampoo 170ml', english_name='TRESemmé Colour Revitalise Shampoo 170ml', updated_at=now() WHERE id='imp_tresemm-tresemm-colour-revitalise-shampoo';
UPDATE public.items SET canonical_name='TRESemmé Keratin Smooth & Straight Shampoo 170ml', english_name='TRESemmé Keratin Smooth & Straight Shampoo 170ml', updated_at=now() WHERE id='imp_tresemm-tresemm-keratin-smooth-straight-shampoo';
UPDATE public.items SET canonical_name='TRESemmé Rich Moisture Shampoo 170ml', english_name='TRESemmé Rich Moisture Shampoo 170ml', updated_at=now() WHERE id='imp_tresemm-tresemm-rich-moisture-shampoo';
UPDATE public.items SET canonical_name='Dettol Shaving Cream Fresh 78g', english_name='Dettol Shaving Cream Fresh 78g', updated_at=now() WHERE id='imp_dettol-dettol-shaving-cream-fresh';
UPDATE public.items SET canonical_name='Gillette Mach3 Razor', english_name='Gillette Mach3 Razor', updated_at=now() WHERE id='imp_gillette-gillette-mach3-razor';
UPDATE public.items SET canonical_name='Faiza Beauty Cream', english_name='Faiza Beauty Cream', updated_at=now() WHERE id='imp_faiza-faiza-beauty-cream';
UPDATE public.items SET canonical_name='Glow & Lovely Advanced Multivitamin Cream', english_name='Glow & Lovely Advanced Multivitamin Cream', updated_at=now() WHERE id='imp_glow-lovely-glow-lovely-advanced-multivitamin-cr';
UPDATE public.items SET canonical_name='Golden Pearl Beauty Cream', english_name='Golden Pearl Beauty Cream', updated_at=now() WHERE id='imp_golden-pearl-golden-pearl-beauty-cream';
UPDATE public.items SET canonical_name='Hemani Rose Water', english_name='Hemani Rose Water', updated_at=now() WHERE id='imp_hemani-hemani-rose-water';
UPDATE public.items SET canonical_name='Himalaya Purifying Neem Face Wash', english_name='Himalaya Purifying Neem Face Wash', updated_at=now() WHERE id='imp_himalaya-himalaya-purifying-neem-face-wash';
UPDATE public.items SET canonical_name='Nivea Creme', english_name='Nivea Creme', updated_at=now() WHERE id='imp_nivea-nivea-creme';
UPDATE public.items SET canonical_name='Nivea Soft Moisturizing Cream', english_name='Nivea Soft Moisturizing Cream', updated_at=now() WHERE id='imp_nivea-nivea-soft-moisturizing-cream';
UPDATE public.items SET canonical_name='Pond''s Cold Cream', english_name='Pond''s Cold Cream', updated_at=now() WHERE id='imp_pond-s-pond-s-cold-cream';
UPDATE public.items SET canonical_name='Pond''s Oil Control Face Wash', english_name='Pond''s Oil Control Face Wash', updated_at=now() WHERE id='imp_pond-s-pond-s-oil-control-face-wash';
UPDATE public.items SET canonical_name='Pond''s Pure White Face Wash', english_name='Pond''s Pure White Face Wash', updated_at=now() WHERE id='imp_pond-s-pond-s-pure-white-face-wash';
UPDATE public.items SET canonical_name='Pond''s Vanishing Cream', english_name='Pond''s Vanishing Cream', updated_at=now() WHERE id='imp_pond-s-pond-s-vanishing-cream';
UPDATE public.items SET canonical_name='Saeed Ghani Ubtan Powder', english_name='Saeed Ghani Ubtan Powder', updated_at=now() WHERE id='imp_saeed-ghani-saeed-ghani-ubtan-powder';
UPDATE public.items SET canonical_name='Stillman''s Skin Bleach Cream 28g', english_name='Stillman''s Skin Bleach Cream 28g', updated_at=now() WHERE id='imp_stillman-s-stillman-s-skin-bleach-cream';
UPDATE public.items SET canonical_name='Tibet Cold Cream', english_name='Tibet Cold Cream', updated_at=now() WHERE id='imp_tibet-tibet-cold-cream';
UPDATE public.items SET canonical_name='Tibet Cream', english_name='Tibet Cream', updated_at=now() WHERE id='imp_tibet-tibet-cream';
UPDATE public.items SET canonical_name='Tibet Talcum Powder', english_name='Tibet Talcum Powder', updated_at=now() WHERE id='imp_tibet-tibet-talcum-powder';
UPDATE public.items SET canonical_name='Vaseline Intensive Care Deep Restore Lotion', english_name='Vaseline Intensive Care Deep Restore Lotion', updated_at=now() WHERE id='imp_vaseline-vaseline-intensive-care-deep-restore-lo';
UPDATE public.items SET canonical_name='Vaseline Original Petroleum Jelly', english_name='Vaseline Original Petroleum Jelly', updated_at=now() WHERE id='imp_vaseline-vaseline-original-petroleum-jelly';
UPDATE public.items SET canonical_name='Capri Beauty Soap', english_name='Capri Beauty Soap', updated_at=now() WHERE id='imp_capri-capri-beauty-soap';
UPDATE public.items SET canonical_name='Dettol Cool Soap', english_name='Dettol Cool Soap', updated_at=now() WHERE id='imp_dettol-dettol-cool-soap';
UPDATE public.items SET canonical_name='Dettol Original Soap', english_name='Dettol Original Soap', updated_at=now() WHERE id='imp_dettol-dettol-original-soap';
UPDATE public.items SET canonical_name='Dettol Skincare Soap', english_name='Dettol Skincare Soap', updated_at=now() WHERE id='imp_dettol-dettol-skincare-soap';
UPDATE public.items SET canonical_name='Dove Beauty Bar Original', english_name='Dove Beauty Bar Original', updated_at=now() WHERE id='imp_dove-dove-beauty-bar-original';
UPDATE public.items SET canonical_name='Lifebuoy Care Soap', english_name='Lifebuoy Care Soap', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-care-soap';
UPDATE public.items SET canonical_name='Lifebuoy Lemon Fresh Soap', english_name='Lifebuoy Lemon Fresh Soap', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-lemon-fresh-soap';
UPDATE public.items SET canonical_name='Lifebuoy Total 10 Soap', english_name='Lifebuoy Total 10 Soap', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-total-10-soap';
UPDATE public.items SET canonical_name='Lux Dreamy Delight Beauty Soap', english_name='Lux Dreamy Delight Beauty Soap', updated_at=now() WHERE id='imp_lux-lux-dreamy-delight-beauty-soap';
UPDATE public.items SET canonical_name='Lux Soft Touch Beauty Soap', english_name='Lux Soft Touch Beauty Soap', updated_at=now() WHERE id='imp_lux-lux-soft-touch-beauty-soap';
UPDATE public.items SET canonical_name='Lux Velvet Touch Beauty Soap', english_name='Lux Velvet Touch Beauty Soap', updated_at=now() WHERE id='imp_lux-lux-velvet-touch-beauty-soap';
UPDATE public.items SET canonical_name='Palmolive Naturals Soap', english_name='Palmolive Naturals Soap', updated_at=now() WHERE id='imp_palmolive-palmolive-naturals-soap';
UPDATE public.items SET canonical_name='Safeguard Lemon Fresh Soap', english_name='Safeguard Lemon Fresh Soap', updated_at=now() WHERE id='imp_safeguard-safeguard-lemon-fresh-soap';
UPDATE public.items SET canonical_name='Safeguard Pure White Soap', english_name='Safeguard Pure White Soap', updated_at=now() WHERE id='imp_safeguard-safeguard-pure-white-soap';
UPDATE public.items SET canonical_name='Sufi Soap', english_name='Sufi Soap', updated_at=now() WHERE id='imp_sufi-sufi-soap';
UPDATE public.items SET canonical_name='Tibet Soap', english_name='Tibet Soap', updated_at=now() WHERE id='imp_tibet-tibet-soap';
UPDATE public.items SET canonical_name='Dettol Antiseptic Liquid 250ml', english_name='Dettol Antiseptic Liquid 250ml', updated_at=now() WHERE id='imp_dettol-dettol-antiseptic-liquid';
UPDATE public.items SET canonical_name='Domex Fresh Guard Toilet Cleaner', english_name='Domex Fresh Guard Toilet Cleaner', updated_at=now() WHERE id='imp_domex-domex-fresh-guard-toilet-cleaner';
UPDATE public.items SET canonical_name='Harpic Bathroom Cleaner', english_name='Harpic Bathroom Cleaner', updated_at=now() WHERE id='imp_harpic-harpic-bathroom-cleaner';
UPDATE public.items SET canonical_name='Harpic Power Plus 10X Toilet Cleaner', english_name='Harpic Power Plus 10X Toilet Cleaner', updated_at=now() WHERE id='imp_harpic-harpic-power-plus-10x-toilet-cleaner';
UPDATE public.items SET canonical_name='Rose Petal Facial Tissues', english_name='Rose Petal Facial Tissues', updated_at=now() WHERE id='imp_rose-petal-rose-petal-facial-tissues';
UPDATE public.items SET canonical_name='Rose Petal Kitchen Towel', english_name='Rose Petal Kitchen Towel', updated_at=now() WHERE id='imp_rose-petal-rose-petal-kitchen-towel';
UPDATE public.items SET canonical_name='Rose Petal Toilet Rolls', english_name='Rose Petal Toilet Rolls', updated_at=now() WHERE id='imp_rose-petal-rose-petal-toilet-rolls';
UPDATE public.items SET canonical_name='Close-Up Menthol Fresh Toothpaste', english_name='Close-Up Menthol Fresh Toothpaste', updated_at=now() WHERE id='imp_close-up-close-up-menthol-fresh-toothpaste';
UPDATE public.items SET canonical_name='Close-Up Red Hot Toothpaste', english_name='Close-Up Red Hot Toothpaste', updated_at=now() WHERE id='imp_close-up-close-up-red-hot-toothpaste';
UPDATE public.items SET canonical_name='Colgate Herbal Toothpaste', english_name='Colgate Herbal Toothpaste', updated_at=now() WHERE id='imp_colgate-colgate-herbal-toothpaste';
UPDATE public.items SET canonical_name='Colgate MaxFresh Toothpaste', english_name='Colgate MaxFresh Toothpaste', updated_at=now() WHERE id='imp_colgate-colgate-maxfresh-toothpaste';
UPDATE public.items SET canonical_name='Colgate Maximum Cavity Protection Toothpaste', english_name='Colgate Maximum Cavity Protection Toothpaste', updated_at=now() WHERE id='imp_colgate-colgate-maximum-cavity-protection-toothp';
UPDATE public.items SET canonical_name='Colgate Slim Soft Toothbrush', english_name='Colgate Slim Soft Toothbrush', updated_at=now() WHERE id='imp_colgate-colgate-slim-soft-toothbrush';
UPDATE public.items SET canonical_name='Colgate Total 12 Toothpaste', english_name='Colgate Total 12 Toothpaste', updated_at=now() WHERE id='imp_colgate-colgate-total-12-toothpaste';
UPDATE public.items SET canonical_name='Listerine Cool Mint Mouthwash', english_name='Listerine Cool Mint Mouthwash', updated_at=now() WHERE id='imp_listerine-listerine-cool-mint-mouthwash';
UPDATE public.items SET canonical_name='Oral-B Toothbrush', english_name='Oral-B Toothbrush', updated_at=now() WHERE id='imp_oral-b-oral-b-toothbrush';
UPDATE public.items SET canonical_name='Pepsodent Action Original Toothpaste', english_name='Pepsodent Action Original Toothpaste', updated_at=now() WHERE id='imp_pepsodent-pepsodent-action-original-toothpaste';
UPDATE public.items SET canonical_name='Sensodyne Rapid Relief Toothpaste', english_name='Sensodyne Rapid Relief Toothpaste', updated_at=now() WHERE id='imp_sensodyne-sensodyne-rapid-relief-toothpaste';
UPDATE public.items SET canonical_name='Sensodyne Repair & Protect Toothpaste', english_name='Sensodyne Repair & Protect Toothpaste', updated_at=now() WHERE id='imp_sensodyne-sensodyne-repair-protect-toothpaste';
UPDATE public.items SET canonical_name='BonaPapa Baby Diapers', english_name='BonaPapa Baby Diapers', updated_at=now() WHERE id='imp_bonapapa-bonapapa-baby-diapers';
UPDATE public.items SET canonical_name='Clearblue Pregnancy Test', english_name='Clearblue Pregnancy Test', updated_at=now() WHERE id='imp_clearblue-clearblue-pregnancy-test';
UPDATE public.items SET canonical_name='Johnson''s Cotton Buds', english_name='Johnson''s Cotton Buds', updated_at=now() WHERE id='imp_johnson-s-johnson-s-cotton-buds';
UPDATE public.items SET canonical_name='Pampers Baby Diapers', english_name='Pampers Baby Diapers', updated_at=now() WHERE id='imp_pampers-pampers-baby-diapers';
UPDATE public.items SET canonical_name='Sudocrem Antiseptic Healing Cream', english_name='Sudocrem Antiseptic Healing Cream', updated_at=now() WHERE id='imp_sudocrem-sudocrem-antiseptic-healing-cream';
UPDATE public.items SET canonical_name='Woodward''s Gripe Water', english_name='Woodward''s Gripe Water', updated_at=now() WHERE id='imp_woodward-s-woodward-s-gripe-water';
UPDATE public.items SET canonical_name='Band-Aid Adhesive Bandages', english_name='Band-Aid Adhesive Bandages', updated_at=now() WHERE id='imp_band-aid-band-aid-adhesive-bandages';
UPDATE public.items SET canonical_name='Betadine Antiseptic Solution', english_name='Betadine Antiseptic Solution', updated_at=now() WHERE id='imp_betadine-betadine-antiseptic-solution';
UPDATE public.items SET canonical_name='Burnol Burn Cream', english_name='Burnol Burn Cream', updated_at=now() WHERE id='imp_burnol-burnol-burn-cream';
UPDATE public.items SET canonical_name='Hansaplast Crepe Bandage', english_name='Hansaplast Crepe Bandage', updated_at=now() WHERE id='imp_hansaplast-hansaplast-crepe-bandage';
UPDATE public.items SET canonical_name='Hansaplast Wound Plaster', english_name='Hansaplast Wound Plaster', updated_at=now() WHERE id='imp_hansaplast-hansaplast-wound-plaster';
UPDATE public.items SET canonical_name='Pyodine Antiseptic Solution', english_name='Pyodine Antiseptic Solution', updated_at=now() WHERE id='imp_pyodine-pyodine-antiseptic-solution';
UPDATE public.items SET canonical_name='Omron Blood Pressure Monitor', english_name='Omron Blood Pressure Monitor', updated_at=now() WHERE id='imp_omron-omron-blood-pressure-monitor';
UPDATE public.items SET canonical_name='Omron Digital Thermometer', english_name='Omron Digital Thermometer', updated_at=now() WHERE id='imp_omron-omron-digital-thermometer';
UPDATE public.items SET canonical_name='Omron Nebulizer', english_name='Omron Nebulizer', updated_at=now() WHERE id='imp_omron-omron-nebulizer';
UPDATE public.items SET canonical_name='On Call Plus Glucometer', english_name='On Call Plus Glucometer', updated_at=now() WHERE id='imp_on-call-plus-on-call-plus-glucometer';
UPDATE public.items SET canonical_name='Rossmax Blood Pressure Monitor', english_name='Rossmax Blood Pressure Monitor', updated_at=now() WHERE id='imp_rossmax-rossmax-blood-pressure-monitor';
UPDATE public.items SET canonical_name='Hydrozole Cream', english_name='Hydrozole Cream', updated_at=now() WHERE id='imp_hydrozole-hydrozole-cream';
UPDATE public.items SET canonical_name='Kenacomb Cream', english_name='Kenacomb Cream', updated_at=now() WHERE id='imp_kenacomb-kenacomb-cream';
UPDATE public.items SET canonical_name='Neosporin Ointment', english_name='Neosporin Ointment', updated_at=now() WHERE id='imp_neosporin-neosporin-ointment';
UPDATE public.items SET canonical_name='Nizoral Anti-Dandruff Shampoo', english_name='Nizoral Anti-Dandruff Shampoo', updated_at=now() WHERE id='imp_nizoral-nizoral-anti-dandruff-shampoo';
UPDATE public.items SET canonical_name='Scabion Lotion', english_name='Scabion Lotion', updated_at=now() WHERE id='imp_scabion-scabion-lotion';
UPDATE public.items SET canonical_name='Centrum Multivitamin', english_name='Centrum Multivitamin', updated_at=now() WHERE id='imp_centrum-centrum-multivitamin';
UPDATE public.items SET canonical_name='Evion Vitamin E', english_name='Evion Vitamin E', updated_at=now() WHERE id='imp_evion-evion-vitamin-e';
UPDATE public.items SET canonical_name='Horlicks Health Drink', english_name='Horlicks Health Drink', updated_at=now() WHERE id='imp_horlicks-horlicks-health-drink';
UPDATE public.items SET canonical_name='Seven Seas Cod Liver Oil', english_name='Seven Seas Cod Liver Oil', updated_at=now() WHERE id='imp_seven-seas-seven-seas-cod-liver-oil';
UPDATE public.items SET canonical_name='Xiaomi 14', english_name='Xiaomi 14', updated_at=now() WHERE id='imp_xiaomi-xiaomi-14';
-- Part 2: fix category_id
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_fauji-corn-flakes';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_kellogg-s-chocos';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_kellogg-s-corn-flakes';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_langnese-honey';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_marhaba-honey';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nestle-cerelac-wheat';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nestle-corn-flakes';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nestle-koko-krunch';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_quaker-oats';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_weetabix-weetabix-original';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-baked-beans';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-fruit-cocktail';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-sweet-corn';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_happy-cow-cheese-slices';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_happy-cow-cheese-triangles';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nurpur-butter';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nurpur-cheese-slices';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_dalda-banaspati';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_dalda-cooking-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_eva-cooking-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_habib-banaspati';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_habib-cooking-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_kashmir-banaspati';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_kashmir-cooking-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_kisan-banaspati';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_kisan-cooking-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mezan-banaspati';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mezan-cooking-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_seasons-canola-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_soya-supreme-banaspati';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_soya-supreme-cooking-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_sufi-banaspati';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_sufi-cooking-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_tullo-banaspati';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_tullo-cooking-oil';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_dairy-omung-milk';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_good-milk-pasteurized-milk';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_haleeb-milk';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_milkpak-cream';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_milkpak-full-cream-milk';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nestle-everyday';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nestle-nesvita';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nestle-nido';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nurpur-desi-ghee';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nurpur-full-cream-milk';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_olper-s-full-cream-milk';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_prema-full-cream-milk';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_tarang-tea-whitener';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-chapli-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-chicken-burger-patty';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-chicken-nuggets';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-chicken-samosa';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-chicken-strips';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-chicken-tempura';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-hot-wings';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-kofta';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-seekh-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-shami-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-spring-rolls';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_k-n-s-tender-pops';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mon-salwa-chicken-chapli-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mon-salwa-chicken-nuggets';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mon-salwa-chicken-samosa';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mon-salwa-chicken-shami-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mon-salwa-plain-paratha';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mon-salwa-spring-rolls';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_sabroso-chicken-nuggets';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_sabroso-chicken-seekh-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_sabroso-chicken-strips';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_american-garden-creamy-peanut-butter';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_american-garden-crunchy-peanut-butter';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-apricot-jam';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-mixed-fruit-jam';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-orange-marmalade';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-strawberry-jam';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-mixed-fruit-jam';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-strawberry-jam';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nutella-hazelnut-spread';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_asia-super-kernel-basmati-rice';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_bake-parlour-chocolate-vermicelli';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_bake-parlour-colour-vermicelli';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_bake-parlour-vermicelli';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_falcon-super-kernel-basmati-rice';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_guard-super-kernel-basmati-rice';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_kolson-elbow-macaroni';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_kolson-spaghetti';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_sunridge-chakki-atta';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_sunridge-maida';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_sunridge-suji';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_knorr-chicken-corn-soup';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_knorr-chicken-noodles';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_knorr-chicken-stock-cubes';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_knorr-chicken-tikka-noodles';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_knorr-hot-sour-soup';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_knorr-tomato-ketchup';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_knorr-tomato-soup';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_knorr-vegetable-soup';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_maggi-2-minute-masala-noodles';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-chilli-garlic-sauce';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-lemon-squash';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-mango-squash';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-orange-squash';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-soya-sauce';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-tomato-ketchup';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-tomato-puree';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mitchell-s-white-vinegar';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chilli-garlic-sauce';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-soya-sauce';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-tomato-ketchup';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-white-vinegar';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shangrila-bbq-sauce';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shangrila-chilli-garlic-sauce';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shangrila-soya-sauce';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shangrila-tomato-ketchup';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shangrila-white-vinegar';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_laziza-firni-mix';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_laziza-gulab-jamun-mix';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_laziza-kheer-mix';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_laziza-kulfi-mix';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_laziza-rasmalai-mix';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_laziza-royal-falooda-mix';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_laziza-vanilla-custard-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_laziza-zarda-mix';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-chapli-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-chicken-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-chicken-chapli-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-chicken-pulao';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-chicken-tikka';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-coriander-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-cumin-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-garam-masala';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-haleem';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-karahi-masala';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-lime-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-mango-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-mixed-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-nihari';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-qorma-masala';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-red-chilli-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-shami-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-sindhi-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_mehran-turmeric-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-achar-gosht';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-beef-chapli-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-bombay-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-butter-chicken';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chana-chaat';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-chapli-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-chowmein';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-handi';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-jalfrezi';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-karahi';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-korma';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-manchurian';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-pulao';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-tikka';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-chicken-white-karahi';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-coriander-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-cumin-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-dahi-baray';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-fruit-chaat';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-garam-masala';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-haleem';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-hyderabadi-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-iodized-salt';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-karahi-gosht';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-lahori-chargha';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-lahori-fish';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-lime-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-malai-boti';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-mango-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-memoni-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-mixed-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-nihari';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-paya';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-qeema';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-red-chilli-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-seekh-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-shami-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-sindhi-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-siri-paya';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-tandoori-masala';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-turmeric-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_national-vegetable-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_rafhan-corn-flour';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_rafhan-mango-custard-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_rafhan-orange-jelly-crystals';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_rafhan-pineapple-jelly-crystals';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_rafhan-strawberry-custard-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_rafhan-strawberry-jelly-crystals';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_rafhan-vanilla-custard-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-achar-gosht';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-beef-chapli-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-bihari-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-bombay-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-butter-chicken';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chana-chaat';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chana-masala';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-chapli-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-chowmein';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-handi';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-jalfrezi';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-karahi';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-korma';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-manchurian';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-pulao';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-tikka';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-chicken-white-karahi';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-coriander-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-cumin-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-dahi-baray';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-dal-fry';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-dal-gosht';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-fruit-chaat';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-garam-masala';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-gola-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-haleem';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-hyderabadi-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-kabuli-pulao';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-karachi-beef-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-lahori-chargha';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-lahori-fish';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-lime-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-malai-boti';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-mango-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-memoni-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-mixed-pickle';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-mutton-karahi';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-nihari';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-pakora-mix';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-pani-puri';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-paya';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-qeema';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-red-chilli-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-samosa';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-seekh-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-shami-kabab';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-sindhi-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-siri-paya';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-tandoori-masala';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-turmeric-powder';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-vegetable-biryani';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_shan-yakhni-pulao';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_lipton-green-tea';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_lipton-taaza';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_lipton-yellow-label';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nescafe-3-in-1';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nescafe-classic';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_nescafe-gold';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_tapal-chenak';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_tapal-danedar';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_tapal-family-mixture';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_tapal-gulbahar';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_tapal-mezban';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_tapal-tezdum';
UPDATE public.items SET category_id='grocery', updated_at=now() WHERE id='imp_vital-vital-tea';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_bisconni-choco-chip-cookies';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_bisconni-chocolatto';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_bisconni-rite-chocolate-vanilla';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_cadbury-mini-fingers';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_danpak-crispy-king-double-chocolate-biscuit-stic';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_innovative-chocolate-chip-cookies';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_jojo-bisko-balls-chocolate-coated-biscuits';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-bravo-milk-cookies';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-jam-hearts-strawberry-vanilla';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lu-bakeri';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lu-candi';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lu-gala-egg-biscuits';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lu-prince-chocolate-sandwich-biscuit';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lu-tiger-glucose-biscuits';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lu-tuc';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_mayfair-cafe-khatai-style-biscuit';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_oreo-oreo-original';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-butter-crunch';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-click';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-cocomo';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-farm-house-cookies-butter';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-farm-house-cookies-chocolate-chip';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-gluco';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-marie';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-peanut-pik';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-rio-chocolate';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-rio-strawberry';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-rio-vanilla';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-saltish';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-sooper-chocolate';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-sooper-elaichi';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-sooper-original';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_peek-freans-zeera-plus';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_aquafina-aquafina';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_gourmet-gourmet-water';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kinley-kinley';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_murree-sparkletts-bottled-drinking-water';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nestle-pure-life';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_dawn-milky-bread';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_dawn-whole-wheat-bread';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_euro-cake-euro-cake';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_hilal-cupkake';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-lotte-choco-pie';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_cheetos-puffs-ketchup';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-cheese-balls';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-chunky-chicken';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-fold-bbq-snack';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-potato-sticks';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-slanty-jalapeno';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-slanty-salted';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-slanty-vegetable';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-snackers-french-cheese';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-snackers-hot-masala';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kolson-twich-classic';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_korneez-popcorn-bbq';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_korneez-popcorn-salted';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kurkure-chutney-chaska';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kurkure-red-chilli-jhatka';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_kurkure-toofaani-mirch';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lay-s-masala';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lay-s-salted';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lay-s-wavy-bbq';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lay-s-wavy-mexican-chili';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lay-s-yogurt-herb';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_popnosh-caramel-crunch';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_popnosh-cheddar-cheese';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_popnosh-choco-loco';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_snack-city-kurleez-mirch-masala';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_snakitos-chickpea-masala';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_snakitos-patata-masala';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_snakitos-patata-salty';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_super-crisp-catty-chins-cheese';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_super-crisp-dino-munchies-ketchup';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_super-crisp-natural-potato-chips-bar-b-q';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_super-crisp-natural-potato-chips-masala';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_super-crisp-natural-potato-chips-salted';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_super-crisp-twister-ketchup';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_top-pops-chicken';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_top-pops-spicy';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_cadbury-5-star';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_cadbury-dairy-milk-classic';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_cadbury-dairy-milk-fruit-nut';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_cadbury-eclairs';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_cadbury-perk';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_candyland-chilli-milli';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_candyland-now';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_candyland-sonnet-chocolate';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_chupa-chups-chupa-chups';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_ferrero-ferrero-rocher';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_ferrero-nutella-chocolate-hazelnut-spread';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_hilal-ding-dong';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_hilal-fresh-up';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_hilal-jelly';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_mars-snickers';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_mayfair-cofied';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_mayfair-minto';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_mentos-mentos-mint';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nestle-kitkat';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_toblerone-toblerone';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_wrigley-doublemint';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_red-bull-red-bull';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_sting-sting';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_hamdard-rooh-afza';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nestle-fruita-vitals-apple';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nestle-fruita-vitals-mango';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nestle-fruita-vitals-orange';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nestle-nesfruta';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_qarshi-jam-e-shirin';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_shezan-lychee-juice';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_shezan-mango-juice';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_slice-slice-mango';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_smile-apple-juice';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_tang-tang-mango';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_tang-tang-orange';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_tropicana-tropicana-orange';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_bunnys-spicy-mix-nimko';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_miilee-bhel-puri';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nimcos-chana-chilli';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nimcos-crunchy-mix';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nimcos-dal-moth';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nimcos-mix-nimco';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_nimcos-spicy-potato-sticks';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_shahi-ballay-ballay-dal-chaska';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_super-crisp-nimko-mix-nuts';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_7up-7up';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_coca-cola-coca-cola-classic';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_coca-cola-coca-cola-zero';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_fanta-fanta-orange';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_gourmet-gourmet-cola';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_mirinda-mirinda-orange';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_mountain-dew-mountain-dew';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_next-cola-next-cola';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_pakola-pakola-ice-cream-soda';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_pepsi-pepsi';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_sprite-sprite';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_lipton-yellow-label-tea';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_milo-milo';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_supreme-supreme-tea';
UPDATE public.items SET category_id='snacks', updated_at=now() WHERE id='imp_tapal-tez-dam';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_canbebe-canbebe-baby-diapers';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-cream';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-lotion';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-oil';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-powder';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_johnson-s-johnson-s-baby-wipes';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_molfix-molfix-baby-diapers';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_molfix-molfix-baby-pants';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pampers-pampers-active-baby-diapers';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pampers-pampers-premium-care-diapers';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_medora-medora-lipstick';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_medora-medora-nail-polish';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_axe-axe-apollo-body-spray';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_axe-axe-dark-temptation-body-spray';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_axe-axe-ice-chill-body-spray';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lemon-max-lemon-max-dishwash-bar';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lemon-max-lemon-max-dishwash-liquid';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_vim-vim-dishwash-bar';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_vim-vim-dishwash-liquid-lemon';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_always-always-sanitary-pads';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dabur-dabur-amla-hair-oil';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dove-dove-hair-fall-rescue-conditioner';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dove-dove-intense-repair-conditioner';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_hemani-hemani-black-seed-oil';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_hemani-hemani-coconut-oil';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-colour-revitalise-conditioner';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-keratin-smooth-straight-conditio';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-keratin-smooth-hair-mask';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-keratin-smooth-serum';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_veet-veet-hair-removal-cream-normal-skin';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_veet-veet-hair-removal-cream-sensitive-skin';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dettol-dettol-cool-liquid-handwash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dettol-dettol-original-liquid-handwash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dettol-dettol-skincare-liquid-handwash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-care-handwash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-lemon-fresh-handwash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-total-10-handwash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_safeguard-safeguard-liquid-handwash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_mortein-mortein-all-insect-killer-spray';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_mortein-mortein-mosquito-repellent-mats';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_mortein-mortein-powergard-mosquito-coils';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_ariel-ariel-complete-detergent-powder';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_ariel-ariel-matic-front-load-detergent';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_ariel-ariel-matic-top-load-detergent';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_bonus-bonus-detergent-powder';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_brite-brite-detergent-powder';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_comfort-comfort-morning-fresh-fabric-conditioner';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_rin-rin-detergent-bar';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_surf-excel-surf-excel-easy-wash-detergent-powder';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_surf-excel-surf-excel-matic-front-load-detergent';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_surf-excel-surf-excel-matic-top-load-detergent';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_clear-clear-complete-active-care-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_clear-clear-cool-sport-menthol-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_clear-clear-men-cool-sport-menthol-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_clear-clear-men-deep-cleanse-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dove-dove-daily-shine-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dove-dove-hair-fall-rescue-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dove-dove-intense-repair-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-anti-hairfall-sham';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-apple-fresh-shampo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-cool-menthol-shamp';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-lemon-fresh-shampo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_head-shoulders-head-shoulders-smooth-silky-shamp';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pantene-pantene-pro-v-hair-fall-control-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pantene-pantene-pro-v-silky-smooth-care-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pantene-pantene-pro-v-total-damage-care-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_sunsilk-sunsilk-anti-dandruff-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_sunsilk-sunsilk-black-shine-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_sunsilk-sunsilk-long-healthy-growth-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_sunsilk-sunsilk-perfect-straight-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_sunsilk-sunsilk-thick-long-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-biotin-repair-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-bondplex-sleek-and-repair-shampo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-botanique-nourish-and-replenish-';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-colour-revitalise-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-keratin-smooth-straight-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tresemm-tresemm-rich-moisture-shampoo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dettol-dettol-shaving-cream-fresh';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_gillette-gillette-mach3-razor';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_faiza-faiza-beauty-cream';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_glow-lovely-glow-lovely-advanced-multivitamin-cr';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_golden-pearl-golden-pearl-beauty-cream';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_hemani-hemani-rose-water';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_himalaya-himalaya-purifying-neem-face-wash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_nivea-nivea-creme';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_nivea-nivea-soft-moisturizing-cream';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pond-s-pond-s-cold-cream';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pond-s-pond-s-oil-control-face-wash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pond-s-pond-s-pure-white-face-wash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pond-s-pond-s-vanishing-cream';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_saeed-ghani-saeed-ghani-ubtan-powder';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_stillman-s-stillman-s-skin-bleach-cream';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tibet-tibet-cold-cream';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tibet-tibet-cream';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tibet-tibet-talcum-powder';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_vaseline-vaseline-intensive-care-deep-restore-lo';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_vaseline-vaseline-original-petroleum-jelly';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_capri-capri-beauty-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dettol-dettol-cool-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dettol-dettol-original-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dettol-dettol-skincare-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dove-dove-beauty-bar-original';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-care-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-lemon-fresh-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lifebuoy-lifebuoy-total-10-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lux-lux-dreamy-delight-beauty-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lux-lux-soft-touch-beauty-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_lux-lux-velvet-touch-beauty-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_palmolive-palmolive-naturals-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_safeguard-safeguard-lemon-fresh-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_safeguard-safeguard-pure-white-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_sufi-sufi-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_tibet-tibet-soap';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_dettol-dettol-antiseptic-liquid';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_domex-domex-fresh-guard-toilet-cleaner';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_harpic-harpic-bathroom-cleaner';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_harpic-harpic-power-plus-10x-toilet-cleaner';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_rose-petal-rose-petal-facial-tissues';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_rose-petal-rose-petal-kitchen-towel';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_rose-petal-rose-petal-toilet-rolls';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_close-up-close-up-menthol-fresh-toothpaste';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_close-up-close-up-red-hot-toothpaste';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_colgate-colgate-herbal-toothpaste';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_colgate-colgate-maxfresh-toothpaste';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_colgate-colgate-maximum-cavity-protection-toothp';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_colgate-colgate-slim-soft-toothbrush';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_colgate-colgate-total-12-toothpaste';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_listerine-listerine-cool-mint-mouthwash';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_oral-b-oral-b-toothbrush';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_pepsodent-pepsodent-action-original-toothpaste';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_sensodyne-sensodyne-rapid-relief-toothpaste';
UPDATE public.items SET category_id='personal_care', updated_at=now() WHERE id='imp_sensodyne-sensodyne-repair-protect-toothpaste';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-pedialyte';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-pediasure';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_bonapapa-bonapapa-baby-diapers';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_clearblue-clearblue-pregnancy-test';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_johnson-s-johnson-s-cotton-buds';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_nestl-cerelac-infant-cereal';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_nestl-lactogen-infant-formula';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_nestl-nan-infant-formula';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_pampers-pampers-baby-diapers';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sudocrem-sudocrem-antiseptic-healing-cream';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-acefyl';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_astrazeneca-bricanyl';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_astrazeneca-pulmicort';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_astrazeneca-rhinocort';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_astrazeneca-symbicort';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_bayer-clarityn';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_boehringer-ingelheim-atrovent';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_boehringer-ingelheim-combivent';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_boehringer-ingelheim-spiriva';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_getz-montika';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_getz-rigix';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-avamys';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-beconase';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-becotide';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-corsodyl';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-flixonase';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-flixotide';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-seretide';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-serevent';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-sinutab';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-ventolin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_hamdard-joshina';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_hamdard-sualin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_mondelez-halls';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_msd-aerius';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_msd-nasonex';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_mundipharma-betadine';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-foradil';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-nezeril';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-otrivin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-sinecod';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-zaditen';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_p-g-vicks-vaporub';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_pfizer-atarax';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_pharmevo-zeet';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_reckitt-strepsils';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-avil';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-bisolvon';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-mucosolvan';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-nasacort';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-phenergan';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-telfast';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_searle-hydryllin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_searle-hydryllin-dm';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_zambon-fluimucil';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-creon';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-dicetel';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-duphalac';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-duspatalin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-ganaton';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-hidrasec';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_bayer-scheriproct';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_getz-onseron';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_getz-risek';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-eno';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-zentel';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-zofran';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_hilton-enzar-hs';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_janssen-imodium';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_janssen-motilium';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_janssen-pariet';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_janssen-vermox';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_johnson-johnson-microlax';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_marhaba-isabgol';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_p-g-pepto-bismol';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_pfizer-debridat';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_phillips-milk-of-magnesia';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_reckitt-gaviscon';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_roche-kytril';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sami-navidoxine';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sami-skilax';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sami-tres-orix';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sami-ulsanic';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-buscopan';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-essentiale';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-flagyl';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-guttalax';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-no-spa';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-proctosedyl';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_searle-anafortan';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_searle-gravinate';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_takeda-pantoloc';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_woodward-s-woodward-s-gripe-water';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-arinac';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-arinac-forte';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-influvac';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-calpol';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_roche-tamiflu';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-vaxigrip';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_band-aid-band-aid-adhesive-bandages';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_betadine-betadine-antiseptic-solution';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_burnol-burnol-burn-cream';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_hansaplast-hansaplast-crepe-bandage';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_hansaplast-hansaplast-wound-plaster';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_pyodine-pyodine-antiseptic-solution';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_reckitt-dettol-antiseptic-liquid';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_omron-omron-blood-pressure-monitor';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_omron-omron-digital-thermometer';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_omron-omron-nebulizer';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_on-call-plus-on-call-plus-glucometer';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_roche-accu-chek-glucometer';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_roche-accu-chek-test-strips';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_rossmax-rossmax-blood-pressure-monitor';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-brexin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-brufen';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-synflex';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_astrazeneca-xylocaine';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_boehringer-ingelheim-mobic';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_ccl-gabanet';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_getz-gabica';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-imigran';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-panadol';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-panadol-extra';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-zyloric';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_haw-par-tiger-balm';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_janssen-sibelium';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_msd-arcoxia';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-cataflam';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-lioresal';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-migranil';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-sirdalud';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-voltaren';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-voltaren-emulgel';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_pfizer-celebrex';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_pfizer-feldene';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_pfizer-lyrica';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_pfizer-ponstan';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_reckitt-disprin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_rottapharm-viartril';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sami-dicloran';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-muscoril';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_sanofi-novalgin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_searle-nuberol';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_searle-nuberol-forte';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_bayer-canesten';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-bactroban';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-betnovate';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-betnovate-c';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-betnovate-n';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-dermovate';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-polyfax';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_hydrozole-hydrozole-cream';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_kenacomb-kenacomb-cream';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_leo-fucicort';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_leo-fucidin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_neosporin-neosporin-ointment';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_nizoral-nizoral-anti-dandruff-shampoo';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_reckitt-dettol-soap';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_scabion-scabion-lotion';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-ensure';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-limcee-vitamin-c';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-osnate-d';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-surbex-z';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_abbott-vidaylin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_bayer-redoxon-vitamin-c';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_bayer-supradyn';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_cadbury-bournvita';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_centrum-centrum-multivitamin';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_evion-evion-vitamin-e';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-celin-vitamin-c';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_gsk-glaxose-d';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_horlicks-horlicks-health-drink';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_merck-neurobion';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_merck-neurobion-forte';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_merck-sangobion';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_nestl-milo';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-cac-1000';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_novartis-cac-1000-plus';
UPDATE public.items SET category_id='health', updated_at=now() WHERE id='imp_seven-seas-seven-seas-cod-liver-oil';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anker-power-bank';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anker-usb-c-cable';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anker-wall-charger';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_apple-watch-se';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_audionic-bluetooth-handsfree';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_audionic-power-bank';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_audionic-tws-earbuds';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_audionic-wall-charger';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_baseus-power-bank';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_baseus-usb-cable';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dany-handsfree';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dany-power-bank';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dany-tws-earbuds';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_generic-extension-board';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_generic-mobile-phone-stand';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_generic-otg-adapter-cable';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_generic-silicone-back-cover';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_generic-tempered-glass-screen-protector';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_qcy-t13-earbuds';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_ronin-car-charger';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_ronin-fast-charger';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_ronin-power-bank';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_ronin-tws-earbuds';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_ronin-usb-cable';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_ronin-wired-handsfree';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-25w-usb-c-charger';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-watch-6';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_sandisk-memory-card';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_sandisk-usb-flash-drive';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-mi-power-bank';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-buds-4-lite';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-smart-band';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_changhong-ruba-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-inverter-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-split-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_ecostar-inverter-ac';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_gree-floor-standing-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_gree-lomo-inverter-ac';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_gree-split-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-inverter-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-split-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_kenwood-e-smart-inverter-ac';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_orient-inverter-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_orient-split-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_pel-inverteron-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tcl-inverter-air-conditioner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anex-citrus-juicer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anex-deep-fryer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anex-electric-kettle';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anex-food-processor';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anex-juicer-blender';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anex-meat-grinder';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_canon-cooking-range';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-cooking-range';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-microwave-oven';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-microwave-oven';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_kenwood-food-processor';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_kenwood-microwave-oven';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_kenwood-stand-mixer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_national-electric-kettle';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_national-juicer-blender';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_national-sandwich-maker';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_philips-airfryer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_philips-electric-kettle';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_philips-hand-blender';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_philips-juicer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_philips-rice-cooker';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_philips-sandwich-maker';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_super-asia-cooking-range';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_super-asia-water-dispenser';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_westpoint-electric-kettle';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_westpoint-food-chopper';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_westpoint-juicer-blender';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_westpoint-microwave-oven';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_westpoint-sandwich-maker';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_westpoint-toaster';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_acer-aspire';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_acer-nitro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_acer-swift';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_apple-imac';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_apple-macbook-air';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_apple-macbook-pro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_asus-rog';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_asus-tuf-gaming';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_asus-vivobook';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_canon-pixma-printer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dell-desktop-pc';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dell-inspiron-15';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dell-latitude';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dell-monitor';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dell-vostro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dell-xps';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_epson-ecotank-printer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hp-all-in-one-pc';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hp-elitebook';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hp-laserjet-printer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hp-monitor';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hp-pavilion-15';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hp-probook';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hp-victus';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hp-wireless-mouse';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lenovo-desktop-pc';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lenovo-ideapad-slim';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lenovo-legion';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lenovo-monitor';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lenovo-thinkbook';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lenovo-thinkpad';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lg-monitor';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_logitech-wireless-keyboard';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_logitech-wireless-mouse';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-monitor';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_apple-iphone-13';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_apple-iphone-14';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_apple-iphone-15';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_apple-iphone-16';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_honor-200';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_honor-x6b';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_honor-x7b';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_honor-x9b';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-gt-20-pro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-hot-30i';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-hot-40';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-hot-40-pro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-hot-40i';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-note-30';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-note-40';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-note-40-pro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-smart-8';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_infinix-zero-30';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_itel-a60';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_itel-a70';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_itel-p55';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_itel-s23';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_itel-s24';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_nokia-105';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_nokia-110';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_nokia-225-4g';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_nokia-c32';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_nokia-g42';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_oppo-a18';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_oppo-a3';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_oppo-a38';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_oppo-a58';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_oppo-a60';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_oppo-a78';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_oppo-reno-11';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_oppo-reno-11f';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_oppo-reno-12';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-11';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-12';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-c51';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-c53';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-c55';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-c61';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-c63';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-c65';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-c67';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_realme-note-50';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a05';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a05s';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a06';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a15';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a16';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a25';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a34';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a35';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a36';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-a55';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-s23';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-s23-fe';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-s23-ultra';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-s24';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-s24-fe';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-s25';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-z-flip-5';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-z-flip-6';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-z-fold-5';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-z-fold-6';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-camon-20';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-camon-20-pro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-camon-30';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-phantom-v-flip';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-pop-7';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-pop-8';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-spark-10c';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-spark-20';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-spark-20c';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tecno-spark-go-2024';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_vivo-v29';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_vivo-v29e';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_vivo-v30';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_vivo-v30e';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_vivo-v40';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_vivo-y100';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_vivo-y17s';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_vivo-y28';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_vivo-y36';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-poco-m6-pro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-poco-x6';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-poco-x6-pro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-12';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-12c';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-13';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-13c';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-a3';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-note-12';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-note-13';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-note-13-pro';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-note-13-pro-2';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-xiaomi-14';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_changhong-ruba-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-deep-freezer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-french-door-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-inverter-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-side-by-side-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_ecostar-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-deep-freezer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-inverter-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-side-by-side-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_kenwood-inverter-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_orient-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_pel-deep-freezer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_pel-inverteron-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_waves-deep-freezer';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_waves-refrigerator';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anex-dry-iron';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anex-room-heater';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anex-steam-iron';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_canon-electric-geyser';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_canon-gas-geyser';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_gfc-ceiling-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_gfc-exhaust-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_gfc-inverter-ceiling-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_gfc-pedestal-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_national-dry-iron';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_pak-fan-bracket-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_pak-fan-ceiling-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_pak-fan-exhaust-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_pak-fan-inverter-ceiling-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_pak-fan-pedestal-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_philips-dry-iron';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_philips-steam-iron';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_philips-vacuum-cleaner';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_royal-bracket-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_royal-ceiling-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_royal-inverter-ceiling-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_royal-pedestal-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_singer-sewing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_super-asia-ceiling-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_super-asia-pedestal-fan';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_super-asia-room-cooler';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_westpoint-dry-iron';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_westpoint-room-heater';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_honor-pad-x9';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lenovo-tab-m10';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lenovo-tab-m11';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lenovo-tab-m9';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-tab-a9';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-tab-a9-2';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-tab-s6-lite';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-tab-s9-fe';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-pad-6';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-pad-se';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anker-soundcore-q20i';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_anker-soundcore-r50i';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_apple-airpods';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_audionic-airbud-tws-earbuds';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_audionic-bluetooth-speaker';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_audionic-wired-handsfree';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_changhong-ruba-led-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-led-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_ecostar-led-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-led-smart-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hisense-qled-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_hisense-smart-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_jbl-charge-5';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_jbl-flip-6';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_jbl-go-3';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_jbl-partybox-110';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_jbl-tune-510bt';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_jbl-tune-720bt';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_jbl-wave-buds';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lg-led-smart-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lg-nanocell-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lg-oled-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_orient-led-smart-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_qcy-t13';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-crystal-4k-uhd-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-galaxy-buds-2';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-qled-4k-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tcl-android-smart-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tcl-google-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_tcl-qled-4k-tv';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-mi-portable-bluetooth-speaker';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_xiaomi-redmi-buds-4';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-front-load-automatic-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_dawlance-top-load-automatic-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-front-load-automatic-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-top-load-automatic-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_haier-twin-tub-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_kenwood-top-load-automatic-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lg-front-load-automatic-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_lg-top-load-automatic-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_samsung-top-load-automatic-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_super-asia-twin-tub-washing-machine';
UPDATE public.items SET category_id='electronics', updated_at=now() WHERE id='imp_waves-twin-tub-washing-machine';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_ags-gl-100';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_ags-gl-50';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_ags-gl-65';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_ags-gl-85';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_ags-hb-100';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_daewoo-dls-65';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_exide-mf-100';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_exide-mf-55l';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_exide-mf-65l';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_exide-mf-75l';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_exide-n-70';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_osaka-mf-70';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_abro-spray-paint';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_areon-ken';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_armor-all-original-protectant';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bosch-spark-plug';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bosch-wiper-blade';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_formula-1-carnauba-wax';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_formula-1-wash-wax';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_ngk-iridium-ix';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_ngk-spark-plug';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_sonax-car-shampoo';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_stp-octane-booster';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_wd-40-multi-use-product';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-accord';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-br-v';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-city-1-2';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-city-1-3';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-city-1-5';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-city-aspire';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-city-aspire-s';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-city-vario';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-civic-oriel';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-civic-rs';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-civic-rs-turbo';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-civic-vti';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-cr-v';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-hr-v';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-elantra-gl';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-elantra-gls';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-excel';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-porter';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-santro';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-shehzore';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-sonata';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-tucson-gls';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-tucson-sport';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hyundai-tucson-ultimate';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_daihatsu-mira';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_daihatsu-move';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-fit';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-vezel';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_mitsubishi-pajero';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_nissan-dayz';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-aqua';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-hilux-surf';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-passo';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-prius';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-vitz';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-carnival';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-classic';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-picanto-at';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-picanto-mt';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-sorento';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-spectra';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-sportage-alpha';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-sportage-awd';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-sportage-fwd';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-stonic-ex';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kia-stonic-ex-2';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_adam-revo';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_baic-bj40';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_baic-x25';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_changan-alsvin';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_changan-karvaan';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_changan-m9-sherpa';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_changan-m9-sherpa-power-1-2l';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_changan-oshan-x7';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_changan-oshan-x7-futuresense';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_chevrolet-joy';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_chevrolet-optra';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_daewoo-cielo';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_daewoo-racer';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_daihatsu-cuore';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_dfsk-glory-580';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_dfsk-glory-580-pro';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_faw-v2';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_haval-h6';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_haval-h6-hev';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_haval-jolion';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_isuzu-d-max';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_mg-hs';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_mg-zs';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_mg-zs-ev';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_mitsubishi-lancer';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_nissan-sunny';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_prince-pearl';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_proton-saga';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_proton-x70';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_united-alpha';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_united-bravo';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_audi-a4';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_audi-a6';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_audi-q5';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bmw-3-series';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bmw-5-series';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bmw-x5';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_land-rover-range-rover';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_land-rover-range-rover-sport';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_lexus-rx';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_mercedes-benz-c-class';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_mercedes-benz-e-class';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_mercedes-benz-glc';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_mercedes-benz-s-class';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-alto-vx';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-alto-vxl';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-alto-vxl-ags';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-alto-vxr';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-apv';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-baleno';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-bolan';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-cultus-vxl';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-cultus-vxl-ags';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-cultus-vxr';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-every-vx';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-every-vxr';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-fx';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-jimny';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-khyber';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-liana';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-margalla';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-mehran-vx';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-mehran-vxr';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-potohar';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-ravi';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-swift-dlx';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-swift-dx';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-swift-gl';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-swift-gl-cvt';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-swift-glx';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-wagon-r-vxl';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-wagon-r-vxl-ags';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-wagon-r-vxr';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-camry';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-corolla-2-0d';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-corolla-altis';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-corolla-altis-grande';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-corolla-altis-x';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-corolla-cross';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-corolla-gli';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-corolla-xli';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-fortuner-2-7-g';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-fortuner-2-8-sigma-4';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-hilux-double-cab-e';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-hilux-double-cab-g';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-hilux-revo';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-hilux-revo-gr-s';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-hilux-single-cab';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-hilux-vigo';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-land-cruiser';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-land-cruiser-prado';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-yaris-ativ';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-yaris-ativ-cvt';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-yaris-ativ-x';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-yaris-gli';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_toyota-yaris-gli-cvt';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_caltex-delo';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_caltex-havoline-formula';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_kixx-g1';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_pso-carient-plus';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_pso-carient-synthetic';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_pso-carient-ultra';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_pso-deo-max';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_shell-advance-ax5';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_shell-helix-hx3';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_shell-helix-hx5';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_shell-helix-hx6';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_shell-helix-hx7';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_shell-helix-ultra';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_shell-rimula-r4';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_total-quartz-5000';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_total-quartz-7000';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_total-quartz-9000';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_total-rubia';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_zic-m9';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_zic-x5';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_zic-x7';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_zic-x9';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-cb-125f';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-cb-150f';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-cd-100';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-cd-70';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-cd-70-dream';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-cg-125';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-cg-125s';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_honda-pridor';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_road-prince-125';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_road-prince-70';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_super-power-125';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_super-power-70';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_united-us-125';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_united-us-70';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-gd-110s';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-gr-150';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-gs-150';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_suzuki-gs-150-se';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_yamaha-yb-125z';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_yamaha-yb-125z-dx';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_yamaha-ybr-125';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_yamaha-ybr-125g';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_qingqi-auto-rickshaw';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_sazgar-auto-rickshaw';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_fiat-480';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_fiat-640';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_massey-ferguson-240';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_massey-ferguson-260';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_massey-ferguson-360';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_massey-ferguson-375';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_massey-ferguson-385';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_massey-ferguson-385-4wd';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_new-holland-480';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_new-holland-640';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bridgestone-b290';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bridgestone-dueler';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bridgestone-ecopia';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bridgestone-potenza';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_bridgestone-turanza';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_dunlop-enasave';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_dunlop-grandtrek';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_dunlop-sp-sport';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-bg-falcon';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-bg-luxo-plus';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-bg-tempo-plus';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-bg-thunder-max';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-bg-traker';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-euro-glide';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-euro-kompact';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-euro-kruze';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-euro-star';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-euro-tycoon';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_general-tyre-xp-2000-ii';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hankook-kinergy';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_hankook-ventus';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_michelin-energy-xm2';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_michelin-pilot-sport';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_michelin-primacy';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_pirelli-cinturato';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_pirelli-p-zero';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_servis-cheetah';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_servis-longlife';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_yokohama-advan';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_yokohama-bluearth';
UPDATE public.items SET category_id='automotive', updated_at=now() WHERE id='imp_yokohama-geolandar';
-- Part 3: seed aliases (corrected names)
INSERT INTO public.item_aliases (id,item_id,alias,language) VALUES
('a_baby_cerelac_53469c1fc2f2','baby_cerelac','سیریلاک','ur'),
('a_baby_cerelac_ec9b31f7405d','baby_cerelac','Cerelac','roman'),
('a_baby_cerelac_efc2ab8aa3b7','baby_cerelac','Baby Cereal','roman'),
('a_baby_cerelac_e4647ff28717','baby_cerelac','Nestle Cerelac','roman'),
('a_baby_cerelac_4f63b3ce58dd','baby_cerelac','Cerelac Baby Food','en'),
('a_baby_diapers_e5bc6c770cbd','baby_diapers','ڈائپرز / پیمپرز','ur'),
('a_baby_diapers_eda64bd17393','baby_diapers','Diapers','roman'),
('a_baby_diapers_7be5be10b1ad','baby_diapers','Pampers','roman'),
('a_baby_diapers_377e643c2cd8','baby_diapers','Baby Diaper','roman'),
('a_baby_diapers_b6d13d4d6973','baby_diapers','Baby Diapers','en'),
('a_bakery_biscuits_8e1068bf1581','bakery_biscuits','بسکٹ','ur'),
('a_bakery_biscuits_db2d405bda8a','bakery_biscuits','Biscuits','roman'),
('a_bakery_biscuits_cbcc72e48672','bakery_biscuits','Biscut','roman'),
('a_bakery_biscuits_597b56e53847','bakery_biscuits','Cookies','roman'),
('a_bakery_bread_4e52b6f1dcc7','bakery_bread','ڈبل روٹی','ur'),
('a_bakery_bread_1296fcaab5ec','bakery_bread','Bread','roman'),
('a_bakery_bread_215026604aca','bakery_bread','Double Roti','roman'),
('a_bakery_bread_f871ab8400d6','bakery_bread','Dawn Bread','roman'),
('a_bakery_buns_83b4696aba26','bakery_buns','برگر بن','ur'),
('a_bakery_buns_15a835197087','bakery_buns','Buns','roman'),
('a_bakery_buns_ecfaebd486fd','bakery_buns','Burger Buns','roman'),
('a_bakery_buns_71d4491b5ac3','bakery_buns','Bun','roman'),
('a_bakery_cake_5e7d939a0c3a','bakery_cake','کیک','ur'),
('a_bakery_cake_41a7f93915f9','bakery_cake','Cake','roman'),
('a_bakery_cake_2841a690fde8','bakery_cake','Tea Cake','roman'),
('a_bakery_cake_f097b737a408','bakery_cake','Fruit Cake','roman'),
('a_bakery_paratha_f0b9505fd79c','bakery_paratha','پراٹھا','ur'),
('a_bakery_paratha_560b98ded73b','bakery_paratha','Paratha','roman'),
('a_bakery_paratha_900c35bcd003','bakery_paratha','Frozen Paratha','roman'),
('a_bakery_paratha_310709e388ca','bakery_paratha','Lachha Paratha','roman'),
('a_bakery_rusks_9791693a4324','bakery_rusks','رس / کیک رس','ur'),
('a_bakery_rusks_b8ccdbffe042','bakery_rusks','Rusk','roman'),
('a_bakery_rusks_f2f3b7ec6412','bakery_rusks','Cake Rusk','roman'),
('a_bakery_rusks_8a5ac8565df1','bakery_rusks','Rusks','en'),
('a_bev_mineral_water_e86d19577bc2','bev_mineral_water','منرل واٹر / پانی','ur'),
('a_bev_mineral_water_f69dcc406a26','bev_mineral_water','Mineral Water','roman'),
('a_bev_mineral_water_7182a971a2ee','bev_mineral_water','Paani','roman'),
('a_bev_mineral_water_12dc37fd5c0a','bev_mineral_water','Nestle Water','roman'),
('a_bev_rooh_afza_6227059d557c','bev_rooh_afza','روح افزا','ur'),
('a_bev_rooh_afza_419e1244cbd1','bev_rooh_afza','Rooh Afza','roman'),
('a_bev_rooh_afza_ea2848423b91','bev_rooh_afza','Jam e Shirin','roman'),
('a_bev_rooh_afza_c61a3d904387','bev_rooh_afza','Lal Sharbat','roman'),
('a_clean_dishwash_0d1f30337eca','clean_dishwash','برتن دھونے کا صابن / وم','ur'),
('a_clean_dishwash_b3d84e782944','clean_dishwash','Dishwash','roman'),
('a_clean_dishwash_4ca4441a868c','clean_dishwash','Bartan ka Sabun','roman'),
('a_clean_dishwash_e9f4e4e15aa1','clean_dishwash','Vim Bar','roman'),
('a_clean_dishwash_5bced8b8dd72','clean_dishwash','Lemon Max','roman'),
('a_clean_dishwash_e20c13fe2812','clean_dishwash','Dish Soap','roman'),
('a_clean_dishwash_33e06d3f03a9','clean_dishwash','Dishwashing Soap','en'),
('a_clean_harpic_93221d2d1a8e','clean_harpic','ہارپک / ٹوائلٹ کلینر','ur'),
('a_clean_harpic_ac5649889ed1','clean_harpic','Harpic','roman'),
('a_clean_harpic_34b59a0918fc','clean_harpic','Toilet Cleaner','roman'),
('a_clean_mop_c8db32508ebe','clean_mop','جھاڑو اور پوچھا','ur'),
('a_clean_mop_9c471ed9cd12','clean_mop','Mop','roman'),
('a_clean_mop_86f98fc116d6','clean_mop','Broom','roman'),
('a_clean_mop_6a00eace6053','clean_mop','Jharoo','roman'),
('a_clean_mop_93f7ff9a087b','clean_mop','Pocha','roman'),
('a_clean_mop_eda4314c06c9','clean_mop','Mop / Broom','en'),
('a_clean_phenyl_debba5b0781d','clean_phenyl','فنائل','ur'),
('a_clean_phenyl_a44c3adab2a5','clean_phenyl','Phenyl','roman'),
('a_clean_phenyl_ce9dac87dba3','clean_phenyl','Finail','roman'),
('a_clean_phenyl_738cecbb56fc','clean_phenyl','Floor Cleaner','roman'),
('a_clean_surf_cbf9e7521001','clean_surf','سرف / واشنگ پاؤڈر','ur'),
('a_clean_surf_f11654e14a6e','clean_surf','Surf','roman'),
('a_clean_surf_dbd7bd6f6e03','clean_surf','Washing Powder','roman'),
('a_clean_surf_33f66a1fd3c7','clean_surf','Surf Excel','roman'),
('a_clean_surf_1f15ab596db5','clean_surf','Ariel','roman'),
('a_clean_surf_3c0ee4bacc90','clean_surf','Bonus','roman'),
('a_cloth_socks_804d28c2a3da','cloth_socks','جرابیں','ur'),
('a_cloth_socks_6d3ff19a48d6','cloth_socks','Jurabein','roman'),
('a_cloth_socks_d1f9f76d3e82','cloth_socks','Socks','roman'),
('a_cloth_socks_94e31df6dee7','cloth_socks','Mojay','roman'),
('a_dairy_butter_9a3526b4f6d1','dairy_butter','مکھن','ur'),
('a_dairy_butter_9964dcf01d7a','dairy_butter','Makhan','roman'),
('a_dairy_butter_d73998cf4de3','dairy_butter','Makkhan','roman'),
('a_dairy_butter_e5961b0baa36','dairy_butter','Butter','roman'),
('a_dairy_cheese_f12847c79d2c','dairy_cheese','پنیر','ur'),
('a_dairy_cheese_a67778b3dcc8','dairy_cheese','Cheese','roman'),
('a_dairy_cheese_4ff021bad4bf','dairy_cheese','Paneer','roman'),
('a_dairy_cream_2fe5617092f0','dairy_cream','بالائی / کریم','ur'),
('a_dairy_cream_df772146f203','dairy_cream','Cream','roman'),
('a_dairy_cream_fa9af409660b','dairy_cream','Malai','roman'),
('a_dairy_cream_e10316dd84dc','dairy_cream','Balai','roman'),
('a_dairy_cream_dee9718bee36','dairy_cream','Fresh Cream','en'),
('a_dairy_milk_edb00eab0e33','dairy_milk','دودھ','ur'),
('a_dairy_milk_4a75b74146e5','dairy_milk','Doodh','roman'),
('a_dairy_milk_bbc34da135c6','dairy_milk','Dudh','roman'),
('a_dairy_milk_2e3d17d28a61','dairy_milk','Tetra Pak Milk','roman'),
('a_dairy_milk_fe91f27b452d','dairy_milk','Olpers','roman'),
('a_dairy_milk_effac42ca7a9','dairy_milk','Milkpak','roman'),
('a_dairy_milk_46310d9c3306','dairy_milk','Fresh Milk','en'),
('a_dairy_yogurt_89787e5653b0','dairy_yogurt','دہی','ur'),
('a_dairy_yogurt_20593a688c46','dairy_yogurt','Dahi','roman'),
('a_dairy_yogurt_efc198b499d5','dairy_yogurt','Dahii','roman'),
('a_dairy_yogurt_283445b37043','dairy_yogurt','Curd','roman'),
('a_dairy_yogurt_6a574c47f5fd','dairy_yogurt','Yogurt','en'),
('a_eggs_farm_dd1eeec9df2a','eggs_farm','انڈے','ur'),
('a_eggs_farm_357ef4aa4680','eggs_farm','Anday','roman'),
('a_eggs_farm_1dc0d72e1fe8','eggs_farm','Ande','roman'),
('a_eggs_farm_a51c46ca412c','eggs_farm','Enday','roman'),
('a_eggs_farm_37958de49a69','eggs_farm','Ende','roman'),
('a_eggs_farm_9890f0697613','eggs_farm','Eggs','roman'),
('a_fruit_apple_027df077226e','fruit_apple','سیب','ur'),
('a_fruit_apple_002662fb4019','fruit_apple','Saib','roman'),
('a_fruit_apple_3e971ecc1485','fruit_apple','Seb','roman'),
('a_fruit_apple_19f73241dd05','fruit_apple','Sayb','roman'),
('a_fruit_apple_9f6290f4436e','fruit_apple','Apple','en'),
('a_fruit_banana_a5843d5babf0','fruit_banana','کیلا','ur'),
('a_fruit_banana_12334bdff965','fruit_banana','Kela','roman'),
('a_fruit_banana_3c02befda777','fruit_banana','Kayla','roman'),
('a_fruit_banana_c6ca253857e5','fruit_banana','Keela','roman'),
('a_fruit_banana_e6f9c347672d','fruit_banana','Banana','en'),
('a_fruit_grapes_1b46eb6d6c86','fruit_grapes','انگور','ur'),
('a_fruit_grapes_275d0ed757c7','fruit_grapes','Angoor','roman'),
('a_fruit_grapes_deb3cf70cea3','fruit_grapes','Angur','roman'),
('a_fruit_grapes_af9d7c5a9abb','fruit_grapes','Grapes','en'),
('a_fruit_guava_61c457e60a55','fruit_guava','امرود','ur'),
('a_fruit_guava_efac99caeff0','fruit_guava','Amrood','roman'),
('a_fruit_guava_a35702fd06a4','fruit_guava','Amrud','roman'),
('a_fruit_guava_a09345ac2053','fruit_guava','Guava','en'),
('a_fruit_mango_06e8a2bf1fd5','fruit_mango','آم','ur'),
('a_fruit_mango_dc91cf7ff549','fruit_mango','Aam','roman'),
('a_fruit_mango_f07ec1b01555','fruit_mango','Am','roman'),
('a_fruit_mango_95f8c2da33b8','fruit_mango','Mango','en'),
('a_fruit_orange_08b701b5787f','fruit_orange','مالٹا','ur'),
('a_fruit_orange_92468e8a6237','fruit_orange','Malta','roman'),
('a_fruit_orange_3a5af717ce39','fruit_orange','Kinnow','roman'),
('a_fruit_orange_acb3a05894b7','fruit_orange','Kino','roman'),
('a_fruit_orange_cdb5889cae68','fruit_orange','Mausambi','roman'),
('a_fruit_orange_909cea0c9705','fruit_orange','Orange','en'),
('a_fruit_pomegranate_e15ba2054ecf','fruit_pomegranate','انار','ur'),
('a_fruit_pomegranate_d003853fa63e','fruit_pomegranate','Anaar','roman'),
('a_fruit_pomegranate_c95090f66b20','fruit_pomegranate','Anar','roman'),
('a_fruit_pomegranate_50c5e70d567c','fruit_pomegranate','Pomegranate','en'),
('a_groc_coffee_aaf2c43a429d','groc_coffee','کافی','ur'),
('a_groc_coffee_3c09b8d09553','groc_coffee','Coffee','roman'),
('a_groc_coffee_e1740f829e4d','groc_coffee','Cofee','roman'),
('a_groc_cooking_oil_9956275f46de','groc_cooking_oil','کوکنگ آئل','ur'),
('a_groc_cooking_oil_f4b3f4545b52','groc_cooking_oil','Cooking Oil','roman'),
('a_groc_cooking_oil_f492349e9829','groc_cooking_oil','Tail','roman'),
('a_groc_cooking_oil_2e006b735fbd','groc_cooking_oil','Tel','roman'),
('a_groc_flour_be3b98d8a890','groc_flour','آٹا','ur'),
('a_groc_flour_c6de61570d7d','groc_flour','Atta','roman'),
('a_groc_flour_3c56eb910158','groc_flour','Aata','roman'),
('a_groc_flour_0a0ca61cbb2d','groc_flour','Chakki Atta','roman'),
('a_groc_flour_bf9fd0168c11','groc_flour','Wheat Flour','en'),
('a_groc_ghee_2cce119d194a','groc_ghee','گھی','ur'),
('a_groc_ghee_fc9fa984d504','groc_ghee','Ghee','roman'),
('a_groc_ghee_f8394d742053','groc_ghee','Banaspati Ghee','roman'),
('a_groc_ghee_0c2de9b75f25','groc_ghee','Desi Ghee','roman'),
('a_groc_lentils_e44c06545342','groc_lentils','دال','ur'),
('a_groc_lentils_4e0e4c277722','groc_lentils','Daal','roman'),
('a_groc_lentils_9356c299853e','groc_lentils','Dal','roman'),
('a_groc_lentils_2edfaa34d5c2','groc_lentils','Daal Chana','roman'),
('a_groc_lentils_ac870fc35d92','groc_lentils','Daal Moong','roman'),
('a_groc_lentils_13d5eb6f35f1','groc_lentils','Lentils (Daal)','en'),
('a_groc_rice_930b35096299','groc_rice','چاول','ur'),
('a_groc_rice_afdf9bb9b6f1','groc_rice','Chawal','roman'),
('a_groc_rice_df291c344c79','groc_rice','Basmati Chawal','roman'),
('a_groc_rice_b098f2785759','groc_rice','Kainat Chawal','roman'),
('a_groc_rice_7ad2b86ceeff','groc_rice','Basmati Rice','en'),
('a_groc_salt_07ce59d45710','groc_salt','نمک','ur'),
('a_groc_salt_ed8019b1759f','groc_salt','Namak','roman'),
('a_groc_salt_1ad1263cf766','groc_salt','National Namak','roman'),
('a_groc_salt_af334c7b6ef8','groc_salt','Salt','en'),
('a_groc_sugar_f67bbad92c7f','groc_sugar','چینی','ur'),
('a_groc_sugar_0dc9d410779f','groc_sugar','Chini','roman'),
('a_groc_sugar_4e81488ccee3','groc_sugar','Cheeni','roman'),
('a_groc_sugar_01ca907905cc','groc_sugar','Chinni','roman'),
('a_groc_sugar_f0dc7a91ef79','groc_sugar','Sugar','en'),
('a_groc_tea_1b4f39f0773c','groc_tea','چائے کی پتی','ur'),
('a_groc_tea_db22be45256d','groc_tea','Chai','roman'),
('a_groc_tea_1e666a2f9365','groc_tea','Patti','roman'),
('a_groc_tea_c01e609eadc3','groc_tea','Chai Patti','roman'),
('a_groc_tea_07ba94738c04','groc_tea','Tea (Chai Patti)','en'),
('a_health_dettol_511943330096','health_dettol','ڈیٹول مائع','ur'),
('a_health_dettol_5bb43a2e8472','health_dettol','Dettol','roman'),
('a_health_dettol_1cec6236e53e','health_dettol','Dettol Liquid','roman'),
('a_health_dettol_a104043a8589','health_dettol','Dettol Antiseptic','en'),
('a_health_panadol_f309f1c12ea8','health_panadol','پیناڈول / پیراسیٹامول','ur'),
('a_health_panadol_16b8fbbaf2ee','health_panadol','Panadol','roman'),
('a_health_panadol_875e75a17cb2','health_panadol','Paracetamol','roman'),
('a_health_panadol_d2603dbb4c24','health_panadol','Disprin','roman'),
('a_health_panadol_ef22c8f2f80d','health_panadol','Paracetamol (Panadol)','en'),
('a_health_saniplast_bf95339c59b2','health_saniplast','سنی پلاس / پٹی','ur'),
('a_health_saniplast_7a2510cbd3c1','health_saniplast','Saniplast','roman'),
('a_health_saniplast_7d7d76683dde','health_saniplast','Bandage','roman'),
('a_health_saniplast_f7c94cea237a','health_saniplast','Plaster','roman'),
('a_health_saniplast_630bfe699230','health_saniplast','Bandage (Saniplast)','en'),
('a_herbal_ajwain_f86a93cae98f','herbal_ajwain','اجوائن','ur'),
('a_herbal_ajwain_070c63efa4c2','herbal_ajwain','Ajwain','roman'),
('a_herbal_ajwain_7e27c6f1a17a','herbal_ajwain','Ajwaen','roman'),
('a_herbal_ajwain_353af2bdf9f2','herbal_ajwain','Ajwan','roman'),
('a_herbal_ajwain_d5c426b883a1','herbal_ajwain','Carom Seeds (Ajwain)','en'),
('a_herbal_alum_d889e0ab5fdd','herbal_alum','پھٹکری','ur'),
('a_herbal_alum_33299e032f20','herbal_alum','Phitkari','roman'),
('a_herbal_alum_c27636baece5','herbal_alum','Fitkari','roman'),
('a_herbal_alum_b6eeff61cf70','herbal_alum','Phatkari','roman'),
('a_herbal_alum_4d256f2b94bb','herbal_alum','Phatakari','roman'),
('a_herbal_alum_9a65fff863ef','herbal_alum','Alum','en'),
('a_herbal_isabgol_7415093002c8','herbal_isabgol','اسپغول چھلکا','ur'),
('a_herbal_isabgol_9825597fc756','herbal_isabgol','Isabgol','roman'),
('a_herbal_isabgol_a834a18fb257','herbal_isabgol','Ispaghol','roman'),
('a_herbal_isabgol_7610030cc928','herbal_isabgol','Ispaghol Chilka','roman'),
('a_herbal_isabgol_522e8c8032f1','herbal_isabgol','Psyllium Husk (Isabgol)','en'),
('a_herbal_kalonji_5c2043d7b79c','herbal_kalonji','کلونجی','ur'),
('a_herbal_kalonji_25944e473621','herbal_kalonji','Kalonji','roman'),
('a_herbal_kalonji_55f172cae5e7','herbal_kalonji','Kalwanji','roman'),
('a_herbal_kalonji_98ac45f08967','herbal_kalonji','Black Seeds','roman'),
('a_herbal_kalonji_c8a5aeba6df6','herbal_kalonji','Nigella Seeds (Kalonji)','en'),
('a_herbal_mulethi_13c95d582ecf','herbal_mulethi','ملٹھی','ur'),
('a_herbal_mulethi_92a767e50331','herbal_mulethi','Mulethi','roman'),
('a_herbal_mulethi_16316fe03865','herbal_mulethi','Mulathi','roman'),
('a_herbal_mulethi_9a8d2bebdea4','herbal_mulethi','Licorice Root','en'),
('a_herbal_senna_8830fd6ef217','herbal_senna','ثنا مکی','ur'),
('a_herbal_senna_280c208359e7','herbal_senna','Sana Makki','roman'),
('a_herbal_senna_3cd6a0697d0c','herbal_senna','Sana al Makki','roman'),
('a_herbal_senna_8b80f04395f5','herbal_senna','Senna Leaves','en'),
('a_hh_tissue_roll_09a7cc34279c','hh_tissue_roll','ٹشو رول','ur'),
('a_hh_tissue_roll_e7a497240efc','hh_tissue_roll','Tissue','roman'),
('a_hh_tissue_roll_3ee6a500262f','hh_tissue_roll','Tissue Roll','roman'),
('a_hh_tissue_roll_d1dd3dcdd48a','hh_tissue_roll','Rose Petal','roman'),
('a_hh_trash_bags_8f823cb26331','hh_trash_bags','کچرے کے شاپر','ur'),
('a_hh_trash_bags_b7e28fe5be98','hh_trash_bags','Trash Bags','roman'),
('a_hh_trash_bags_f4884ecafd74','hh_trash_bags','Kachra Bag','roman'),
('a_hh_trash_bags_0a1eb3b7c2fa','hh_trash_bags','Shopper','roman'),
('a_home_towel_d78760e640c9','home_towel','تولیہ','ur'),
('a_home_towel_aabad2da7b27','home_towel','Towel','roman'),
('a_home_towel_d087fdbc60d0','home_towel','Toliya','roman'),
('a_home_towel_7239193b77cf','home_towel','Towal','roman'),
('a_home_towel_b98bb88f9f23','home_towel','Bath Towel','en'),
('a_household_charcoal_fbad31f23ca6','household_charcoal','کوئلہ','ur'),
('a_household_charcoal_6c1dfc650906','household_charcoal','Koyla','roman'),
('a_household_charcoal_5459928475d6','household_charcoal','Charcoal','roman'),
('a_household_charcoal_975c376c8ca4','household_charcoal','Koela','roman'),
('a_hw_led_bulb_cada498a5db2','hw_led_bulb','ایل ای ڈی بلب','ur'),
('a_hw_led_bulb_0c9ff14689b0','hw_led_bulb','LED Bulb','roman'),
('a_hw_led_bulb_2b56dc3133a0','hw_led_bulb','Bulb','roman'),
('a_hw_led_bulb_05a6d5ebd840','hw_led_bulb','Light Bulb','roman'),
('a_hw_limestone_d659f3cdcb95','hw_limestone','چونا','ur'),
('a_hw_limestone_8a24a80f824b','hw_limestone','Choona','roman'),
('a_hw_limestone_e942fd8e34c7','hw_limestone','Chuna','roman'),
('a_hw_limestone_9debfa34dd38','hw_limestone','Limestone','en'),
('a_hw_super_glue_ba716c857e24','hw_super_glue','ایلفی / گلو','ur'),
('a_hw_super_glue_216c2c46ef68','hw_super_glue','Elfy','roman'),
('a_hw_super_glue_98c6cad2d3ad','hw_super_glue','Alfy','roman'),
('a_hw_super_glue_1769694124c7','hw_super_glue','Super Glue','roman'),
('a_hw_super_glue_88621de6d6b0','hw_super_glue','Super Glue (Elfy)','en'),
('a_imp_7up-7up_fd779d8c9757','imp_7up-7up','7UP 500ml','en'),
('a_imp_abbott-acefyl_57691d617757','imp_abbott-acefyl','Abbott Acefyl','en'),
('a_imp_abbott-arinac_648da89cabd1','imp_abbott-arinac','Abbott Arinac','en'),
('a_imp_abbott-arinac-forte_276617335b93','imp_abbott-arinac-forte','Abbott Arinac Forte','en'),
('a_imp_abbott-brexin_ccf964a25a28','imp_abbott-brexin','Abbott Brexin','en'),
('a_imp_abbott-brufen_029d63344759','imp_abbott-brufen','Abbott Brufen','en'),
('a_imp_abbott-creon_b622adfb812d','imp_abbott-creon','Abbott Creon','en'),
('a_imp_abbott-dicetel_fb3f8db790c7','imp_abbott-dicetel','Abbott Dicetel','en'),
('a_imp_abbott-duphalac_c2241807a98b','imp_abbott-duphalac','Abbott Duphalac','en'),
('a_imp_abbott-duspatalin_e0184fe7ba58','imp_abbott-duspatalin','Abbott Duspatalin','en'),
('a_imp_abbott-ensure_54bf35eb3245','imp_abbott-ensure','Abbott Ensure','en'),
('a_imp_abbott-ganaton_ef316c1bc584','imp_abbott-ganaton','Abbott Ganaton','en'),
('a_imp_abbott-hidrasec_e1b27a6ea1cc','imp_abbott-hidrasec','Abbott Hidrasec','en'),
('a_imp_abbott-influvac_9675cf919265','imp_abbott-influvac','Abbott Influvac','en'),
('a_imp_abbott-limcee-vitamin-c_a05c196bb4d8','imp_abbott-limcee-vitamin-c','Abbott Limcee Vitamin C','en'),
('a_imp_abbott-osnate-d_9daa75370e48','imp_abbott-osnate-d','Abbott Osnate-D','en'),
('a_imp_abbott-pedialyte_4489c43aa749','imp_abbott-pedialyte','Abbott Pedialyte','en'),
('a_imp_abbott-pediasure_811a9bd3e574','imp_abbott-pediasure','Abbott PediaSure','en'),
('a_imp_abbott-surbex-z_36a3e1fd929b','imp_abbott-surbex-z','Abbott Surbex-Z','en'),
('a_imp_abbott-synflex_0ac77cfffd2e','imp_abbott-synflex','Abbott Synflex','en'),
('a_imp_abbott-vidaylin_94f04536b1ac','imp_abbott-vidaylin','Abbott Vidaylin','en'),
('a_imp_abro-spray-paint_a52e4547db4f','imp_abro-spray-paint','ABRO Spray Paint','en'),
('a_imp_acer-aspire_0754e54d7b93','imp_acer-aspire','Acer Aspire','en'),
('a_imp_acer-nitro_bd535506d9ab','imp_acer-nitro','Acer Nitro','en'),
('a_imp_acer-swift_0d262b166694','imp_acer-swift','Acer Swift','en'),
('a_imp_adam-revo_2454ad9beb92','imp_adam-revo','Adam Revo','en'),
('a_imp_ags-gl-100_62681f4f9c0d','imp_ags-gl-100','AGS GL 100','en'),
('a_imp_ags-gl-50_1fa8d2833ff8','imp_ags-gl-50','AGS GL 50','en'),
('a_imp_ags-gl-65_38050dcfb052','imp_ags-gl-65','AGS GL 65','en'),
('a_imp_ags-gl-85_fd44365b8d6a','imp_ags-gl-85','AGS GL 85','en'),
('a_imp_ags-hb-100_b58619782560','imp_ags-hb-100','AGS HB 100','en'),
('a_imp_always-always-sanitary-pads_5156b03a1393','imp_always-always-sanitary-pads','Always Sanitary Pads','en'),
('a_imp_american-garden-creamy-peanut-butter_0c7ed2dbf9e3','imp_american-garden-creamy-peanut-butter','American Garden Creamy Peanut Butter','en'),
('a_imp_american-garden-crunchy-peanut-butter_30f350eeff7b','imp_american-garden-crunchy-peanut-butter','American Garden Crunchy Peanut Butter','en'),
('a_imp_anex-citrus-juicer_ce531cb1ea43','imp_anex-citrus-juicer','Anex Citrus Juicer','en'),
('a_imp_anex-deep-fryer_aaaba74af53c','imp_anex-deep-fryer','Anex Deep Fryer','en'),
('a_imp_anex-dry-iron_d49d6a05ab53','imp_anex-dry-iron','Anex Dry Iron','en'),
('a_imp_anex-electric-kettle_51cd5484ceb3','imp_anex-electric-kettle','Anex Electric Kettle','en'),
('a_imp_anex-food-processor_7b46c5206633','imp_anex-food-processor','Anex Food Processor','en'),
('a_imp_anex-juicer-blender_4bafd87f61ad','imp_anex-juicer-blender','Anex Juicer Blender','en'),
('a_imp_anex-meat-grinder_1712b201dc65','imp_anex-meat-grinder','Anex Meat Grinder','en'),
('a_imp_anex-room-heater_c32dd9e03ed5','imp_anex-room-heater','Anex Room Heater','en'),
('a_imp_anex-steam-iron_efd82ce884d8','imp_anex-steam-iron','Anex Steam Iron','en'),
('a_imp_anker-power-bank_1a439015c0ac','imp_anker-power-bank','Anker Power Bank','en'),
('a_imp_anker-soundcore-q20i_9a55389ea8f5','imp_anker-soundcore-q20i','Anker Soundcore Q20i','en'),
('a_imp_anker-soundcore-r50i_d74755a4356a','imp_anker-soundcore-r50i','Anker Soundcore R50i','en'),
('a_imp_anker-usb-c-cable_418928e6112c','imp_anker-usb-c-cable','Anker USB-C Cable','en'),
('a_imp_anker-wall-charger_402c2c185c16','imp_anker-wall-charger','Anker Wall Charger','en'),
('a_imp_apple-airpods_d08df3035d6c','imp_apple-airpods','Apple AirPods','en'),
('a_imp_apple-imac_72714d062cc7','imp_apple-imac','Apple iMac','en'),
('a_imp_apple-iphone-13_e5c5fbfc3b9c','imp_apple-iphone-13','Apple iPhone 13','en'),
('a_imp_apple-iphone-14_6c80762aa587','imp_apple-iphone-14','Apple iPhone 14','en'),
('a_imp_apple-iphone-15_bca953eb199f','imp_apple-iphone-15','Apple iPhone 15','en'),
('a_imp_apple-iphone-16_cf9fd4020bc6','imp_apple-iphone-16','Apple iPhone 16','en'),
('a_imp_apple-macbook-air_a82cc86c6e9c','imp_apple-macbook-air','Apple MacBook Air','en'),
('a_imp_apple-macbook-pro_8cd303e0b445','imp_apple-macbook-pro','Apple MacBook Pro','en'),
('a_imp_apple-watch-se_fa74c4159420','imp_apple-watch-se','Apple Watch SE','en'),
('a_imp_aquafina-aquafina_eba8217b5591','imp_aquafina-aquafina','Aquafina 500ml','en'),
('a_imp_areon-ken_f787d1dbc96c','imp_areon-ken','Areon Ken','en'),
('a_imp_ariel-ariel-complete-detergent-powder_4f2cde38e1bf','imp_ariel-ariel-complete-detergent-powder','Ariel Complete Detergent Powder 1kg','en'),
('a_imp_ariel-ariel-matic-front-load-detergent_ead025d3f975','imp_ariel-ariel-matic-front-load-detergent','Ariel Matic Front Load Detergent 1kg','en'),
('a_imp_ariel-ariel-matic-top-load-detergent_0ffb23199f7a','imp_ariel-ariel-matic-top-load-detergent','Ariel Matic Top Load Detergent 1kg','en'),
('a_imp_armor-all-original-protectant_ec4b29a33248','imp_armor-all-original-protectant','Armor All Original Protectant','en'),
('a_imp_asia-super-kernel-basmati-rice_1a532a2e9b0c','imp_asia-super-kernel-basmati-rice','Asia Super Kernel Basmati Rice 5kg','en'),
('a_imp_astrazeneca-bricanyl_e19ae44617f8','imp_astrazeneca-bricanyl','AstraZeneca Bricanyl','en'),
('a_imp_astrazeneca-pulmicort_f371bdad9781','imp_astrazeneca-pulmicort','AstraZeneca Pulmicort','en'),
('a_imp_astrazeneca-rhinocort_ea2681479062','imp_astrazeneca-rhinocort','AstraZeneca Rhinocort','en'),
('a_imp_astrazeneca-symbicort_b5f47e00283c','imp_astrazeneca-symbicort','AstraZeneca Symbicort','en'),
('a_imp_astrazeneca-xylocaine_49a1167c3426','imp_astrazeneca-xylocaine','AstraZeneca Xylocaine','en'),
('a_imp_asus-rog_74ee003addd7','imp_asus-rog','Asus ROG','en'),
('a_imp_asus-tuf-gaming_129b7251a068','imp_asus-tuf-gaming','Asus TUF Gaming','en'),
('a_imp_asus-vivobook_a3c8891ebde5','imp_asus-vivobook','Asus VivoBook','en'),
('a_imp_audi-a4_01486db40d35','imp_audi-a4','Audi A4','en'),
('a_imp_audi-a6_11bda78f2948','imp_audi-a6','Audi A6','en'),
('a_imp_audi-q5_ed07c10a47e5','imp_audi-q5','Audi Q5','en'),
('a_imp_audionic-airbud-tws-earbuds_a631b07bbf8d','imp_audionic-airbud-tws-earbuds','Audionic Airbud TWS Earbuds','en'),
('a_imp_audionic-bluetooth-handsfree_582ca0ef8d5c','imp_audionic-bluetooth-handsfree','Audionic Bluetooth Handsfree','en'),
('a_imp_audionic-bluetooth-speaker_e4240cf1c638','imp_audionic-bluetooth-speaker','Audionic Bluetooth Speaker','en'),
('a_imp_audionic-power-bank_f5c3456a4021','imp_audionic-power-bank','Audionic Power Bank','en'),
('a_imp_audionic-tws-earbuds_80a97075689a','imp_audionic-tws-earbuds','Audionic TWS Earbuds','en'),
('a_imp_audionic-wall-charger_32496f1e0fcb','imp_audionic-wall-charger','Audionic Wall Charger','en'),
('a_imp_audionic-wired-handsfree_3cfcbc582d57','imp_audionic-wired-handsfree','Audionic Wired Handsfree','en'),
('a_imp_axe-axe-apollo-body-spray_0273492a5af8','imp_axe-axe-apollo-body-spray','Axe Apollo Body Spray 150ml','en'),
('a_imp_axe-axe-dark-temptation-body-spray_22b09c433a5f','imp_axe-axe-dark-temptation-body-spray','Axe Dark Temptation Body Spray 150ml','en'),
('a_imp_axe-axe-ice-chill-body-spray_024b06fca08f','imp_axe-axe-ice-chill-body-spray','Axe Ice Chill Body Spray 150ml','en'),
('a_imp_baic-bj40_518af280fc7c','imp_baic-bj40','BAIC BJ40','en'),
('a_imp_baic-x25_0c219e215256','imp_baic-x25','BAIC X25','en'),
('a_imp_bake-parlour-chocolate-vermicelli_f91d59ccd4ad','imp_bake-parlour-chocolate-vermicelli','Bake Parlour Chocolate Vermicelli','en'),
('a_imp_bake-parlour-colour-vermicelli_0fe42bd74e3e','imp_bake-parlour-colour-vermicelli','Bake Parlour Colour Vermicelli','en'),
('a_imp_bake-parlour-vermicelli_d735d6c8a3cc','imp_bake-parlour-vermicelli','Bake Parlour Vermicelli','en'),
('a_imp_band-aid-band-aid-adhesive-bandages_254da0d241cf','imp_band-aid-band-aid-adhesive-bandages','Band-Aid Adhesive Bandages','en'),
('a_imp_baseus-power-bank_ec239093552d','imp_baseus-power-bank','Baseus Power Bank','en'),
('a_imp_baseus-usb-cable_6e19db58606a','imp_baseus-usb-cable','Baseus USB Cable','en'),
('a_imp_bayer-canesten_2d9623668cef','imp_bayer-canesten','Bayer Canesten','en'),
('a_imp_bayer-clarityn_3f72da421eb7','imp_bayer-clarityn','Bayer Clarityn','en'),
('a_imp_bayer-redoxon-vitamin-c_b8974fa19c18','imp_bayer-redoxon-vitamin-c','Bayer Redoxon Vitamin C','en'),
('a_imp_bayer-scheriproct_34f213494824','imp_bayer-scheriproct','Bayer Scheriproct','en'),
('a_imp_bayer-supradyn_ddae78da104a','imp_bayer-supradyn','Bayer Supradyn','en'),
('a_imp_betadine-betadine-antiseptic-solution_2b8a4822c767','imp_betadine-betadine-antiseptic-solution','Betadine Antiseptic Solution','en'),
('a_imp_bisconni-choco-chip-cookies_a89b629d8d0b','imp_bisconni-choco-chip-cookies','Bisconni Choco Chip Cookies','en'),
('a_imp_bisconni-chocolatto_082ff9b728eb','imp_bisconni-chocolatto','Bisconni Chocolatto','en'),
('a_imp_bisconni-rite-chocolate-vanilla_9e5fa1886b5a','imp_bisconni-rite-chocolate-vanilla','Bisconni Rite Chocolate & Vanilla','en'),
('a_imp_bmw-3-series_d42bd9147ad6','imp_bmw-3-series','BMW 3 Series','en'),
('a_imp_bmw-5-series_868ed03d8a80','imp_bmw-5-series','BMW 5 Series','en'),
('a_imp_bmw-x5_02107cf0911c','imp_bmw-x5','BMW X5','en'),
('a_imp_boehringer-ingelheim-atrovent_9d18182d94c5','imp_boehringer-ingelheim-atrovent','Boehringer Ingelheim Atrovent','en'),
('a_imp_boehringer-ingelheim-combivent_ce612a583e14','imp_boehringer-ingelheim-combivent','Boehringer Ingelheim Combivent','en'),
('a_imp_boehringer-ingelheim-mobic_332b8e37723e','imp_boehringer-ingelheim-mobic','Boehringer Ingelheim Mobic','en'),
('a_imp_boehringer-ingelheim-spiriva_8ecd4615d303','imp_boehringer-ingelheim-spiriva','Boehringer Ingelheim Spiriva','en'),
('a_imp_bonapapa-bonapapa-baby-diapers_58e63e56d288','imp_bonapapa-bonapapa-baby-diapers','BonaPapa Baby Diapers','en'),
('a_imp_bonus-bonus-detergent-powder_0e2fb4718535','imp_bonus-bonus-detergent-powder','Bonus Detergent Powder 1kg','en'),
('a_imp_bosch-spark-plug_7316ceaae2e5','imp_bosch-spark-plug','Bosch Spark Plug','en'),
('a_imp_bosch-wiper-blade_8bbd64ea8ff9','imp_bosch-wiper-blade','Bosch Wiper Blade','en'),
('a_imp_bridgestone-b290_9e94080724f6','imp_bridgestone-b290','Bridgestone B290','en'),
('a_imp_bridgestone-dueler_a2cfb30a2994','imp_bridgestone-dueler','Bridgestone Dueler','en'),
('a_imp_bridgestone-ecopia_99b9f1bdf3d8','imp_bridgestone-ecopia','Bridgestone Ecopia','en'),
('a_imp_bridgestone-potenza_4b782eec151c','imp_bridgestone-potenza','Bridgestone Potenza','en'),
('a_imp_bridgestone-turanza_78735dc6a1c4','imp_bridgestone-turanza','Bridgestone Turanza','en'),
('a_imp_brite-brite-detergent-powder_94e6586d1837','imp_brite-brite-detergent-powder','Brite Detergent Powder 1kg','en'),
('a_imp_bunnys-spicy-mix-nimko_44cbf1f75dff','imp_bunnys-spicy-mix-nimko','Bunnys Spicy Mix Nimko','en'),
('a_imp_burnol-burnol-burn-cream_df1860ae1f71','imp_burnol-burnol-burn-cream','Burnol Burn Cream','en'),
('a_imp_cadbury-5-star_ed399c822c44','imp_cadbury-5-star','Cadbury 5 Star','en'),
('a_imp_cadbury-bournvita_5f63125f7210','imp_cadbury-bournvita','Cadbury Bournvita','en'),
('a_imp_cadbury-dairy-milk-classic_0f1fe9b03af2','imp_cadbury-dairy-milk-classic','Cadbury Dairy Milk Classic','en'),
('a_imp_cadbury-dairy-milk-fruit-nut_12ef437e8c64','imp_cadbury-dairy-milk-fruit-nut','Cadbury Dairy Milk Fruit & Nut','en'),
('a_imp_cadbury-eclairs_e230303b71cb','imp_cadbury-eclairs','Cadbury Eclairs','en'),
('a_imp_cadbury-mini-fingers_dca8ab69c8e4','imp_cadbury-mini-fingers','Cadbury Mini Fingers','en'),
('a_imp_cadbury-perk_8281201b5599','imp_cadbury-perk','Cadbury Perk','en'),
('a_imp_caltex-delo_44f62e62e314','imp_caltex-delo','Caltex Delo','en'),
('a_imp_caltex-havoline-formula_468b982e4451','imp_caltex-havoline-formula','Caltex Havoline Formula','en'),
('a_imp_canbebe-canbebe-baby-diapers_0680380b876b','imp_canbebe-canbebe-baby-diapers','Canbebe Baby Diapers','en'),
('a_imp_candyland-chilli-milli_309300ff4cd2','imp_candyland-chilli-milli','Candyland Chilli Milli','en'),
('a_imp_candyland-now_d4e38e802dca','imp_candyland-now','Candyland Now','en'),
('a_imp_candyland-sonnet-chocolate_f64b08eb316d','imp_candyland-sonnet-chocolate','Candyland Sonnet Chocolate','en'),
('a_imp_canon-cooking-range_8f0f66fa1e10','imp_canon-cooking-range','Canon Cooking Range','en'),
('a_imp_canon-electric-geyser_b0d2ccda5178','imp_canon-electric-geyser','Canon Electric Geyser','en'),
('a_imp_canon-gas-geyser_f77d8324b68c','imp_canon-gas-geyser','Canon Gas Geyser','en'),
('a_imp_canon-pixma-printer_d1d5bdfd5e09','imp_canon-pixma-printer','Canon PIXMA Printer','en'),
('a_imp_capri-capri-beauty-soap_63eb21118751','imp_capri-capri-beauty-soap','Capri Beauty Soap','en'),
('a_imp_ccl-gabanet_cbfa084eb9b3','imp_ccl-gabanet','CCL Gabanet','en'),
('a_imp_centrum-centrum-multivitamin_aa4a1d7ae83b','imp_centrum-centrum-multivitamin','Centrum Multivitamin','en'),
('a_imp_changan-alsvin_c40b37228e80','imp_changan-alsvin','Changan Alsvin','en'),
('a_imp_changan-karvaan_1ef91c998e2b','imp_changan-karvaan','Changan Karvaan','en'),
('a_imp_changan-m9-sherpa_4cd78fcf8d90','imp_changan-m9-sherpa','Changan M9 Sherpa','en'),
('a_imp_changan-m9-sherpa-power-1-2l_62b532018f87','imp_changan-m9-sherpa-power-1-2l','Changan M9 Sherpa Power 1.2L','en'),
('a_imp_changan-oshan-x7_af92cd3ce20f','imp_changan-oshan-x7','Changan Oshan X7','en'),
('a_imp_changan-oshan-x7-futuresense_2efa69f022bd','imp_changan-oshan-x7-futuresense','Changan Oshan X7 FutureSense','en'),
('a_imp_changhong-ruba-air-conditioner_42cf160ec01e','imp_changhong-ruba-air-conditioner','Changhong Ruba Air Conditioner','en'),
('a_imp_changhong-ruba-led-tv_8a8be405659f','imp_changhong-ruba-led-tv','Changhong Ruba LED TV','en'),
('a_imp_changhong-ruba-refrigerator_ed8e8f2ab123','imp_changhong-ruba-refrigerator','Changhong Ruba Refrigerator','en'),
('a_imp_cheetos-puffs-ketchup_fdb4d172bc2b','imp_cheetos-puffs-ketchup','Cheetos Puffs Ketchup','en'),
('a_imp_chevrolet-joy_e461d90ac302','imp_chevrolet-joy','Chevrolet Joy','en'),
('a_imp_chevrolet-optra_78dfc30ae551','imp_chevrolet-optra','Chevrolet Optra','en'),
('a_imp_chupa-chups-chupa-chups_d0fa9728b225','imp_chupa-chups-chupa-chups','Chupa Chups','en'),
('a_imp_clear-clear-complete-active-care-shampoo_3470fb2c0e95','imp_clear-clear-complete-active-care-shampoo','Clear Complete Active Care Shampoo','en'),
('a_imp_clear-clear-cool-sport-menthol-shampoo_58eb6e65c140','imp_clear-clear-cool-sport-menthol-shampoo','Clear Cool Sport Menthol Shampoo','en'),
('a_imp_clear-clear-men-cool-sport-menthol-shampoo_d6487eba6ee7','imp_clear-clear-men-cool-sport-menthol-shampoo','Clear Men Cool Sport Menthol Shampoo','en'),
('a_imp_clear-clear-men-deep-cleanse-shampoo_6d886c167f24','imp_clear-clear-men-deep-cleanse-shampoo','Clear Men Deep Cleanse Shampoo','en'),
('a_imp_clearblue-clearblue-pregnancy-test_6bac108177e0','imp_clearblue-clearblue-pregnancy-test','Clearblue Pregnancy Test','en'),
('a_imp_close-up-close-up-menthol-fresh-toothpaste_2a94e9921ba9','imp_close-up-close-up-menthol-fresh-toothpaste','Close-Up Menthol Fresh Toothpaste','en'),
('a_imp_close-up-close-up-red-hot-toothpaste_cd20f7bb3455','imp_close-up-close-up-red-hot-toothpaste','Close-Up Red Hot Toothpaste','en'),
('a_imp_coca-cola-coca-cola-classic_4840ad9e29cc','imp_coca-cola-coca-cola-classic','Coca-Cola Classic 500ml','en'),
('a_imp_coca-cola-coca-cola-zero_44cc6bbfb3fb','imp_coca-cola-coca-cola-zero','Coca-Cola Zero 500ml','en'),
('a_imp_colgate-colgate-herbal-toothpaste_15b92af9bc8b','imp_colgate-colgate-herbal-toothpaste','Colgate Herbal Toothpaste','en'),
('a_imp_colgate-colgate-maxfresh-toothpaste_ac66b7feae40','imp_colgate-colgate-maxfresh-toothpaste','Colgate MaxFresh Toothpaste','en'),
('a_imp_colgate-colgate-maximum-cavity-protection-toothp_ea8a4a39a601','imp_colgate-colgate-maximum-cavity-protection-toothp','Colgate Maximum Cavity Protection Toothpaste','en'),
('a_imp_colgate-colgate-slim-soft-toothbrush_80fce1874ddc','imp_colgate-colgate-slim-soft-toothbrush','Colgate Slim Soft Toothbrush','en'),
('a_imp_colgate-colgate-total-12-toothpaste_7a39c2c5e422','imp_colgate-colgate-total-12-toothpaste','Colgate Total 12 Toothpaste','en'),
('a_imp_comfort-comfort-morning-fresh-fabric-conditioner_f58987d209e5','imp_comfort-comfort-morning-fresh-fabric-conditioner','Comfort Morning Fresh Fabric Conditioner 500ml','en'),
('a_imp_dabur-dabur-amla-hair-oil_e0acc82d66d3','imp_dabur-dabur-amla-hair-oil','Dabur Amla Hair Oil','en'),
('a_imp_daewoo-cielo_061bb048e74c','imp_daewoo-cielo','Daewoo Cielo','en'),
('a_imp_daewoo-dls-65_c4648989193c','imp_daewoo-dls-65','Daewoo DLS 65','en'),
('a_imp_daewoo-racer_ceac9a33b310','imp_daewoo-racer','Daewoo Racer','en'),
('a_imp_daihatsu-cuore_f06b08682ac7','imp_daihatsu-cuore','Daihatsu Cuore','en'),
('a_imp_daihatsu-mira_14520933f8c3','imp_daihatsu-mira','Daihatsu Mira','en'),
('a_imp_daihatsu-move_ac4608af5f8b','imp_daihatsu-move','Daihatsu Move','en'),
('a_imp_dairy-omung-milk_fa984e8fa315','imp_dairy-omung-milk','Dairy Omung Milk 1L','en'),
('a_imp_dalda-banaspati_a122cff0c72d','imp_dalda-banaspati','Dalda Banaspati 5kg','en'),
('a_imp_dalda-cooking-oil_c221e576f913','imp_dalda-cooking-oil','Dalda Cooking Oil 5L','en'),
('a_imp_danpak-crispy-king-double-chocolate-biscuit-stic_ba844fc873a7','imp_danpak-crispy-king-double-chocolate-biscuit-stic','Danpak Crispy King Double Chocolate Biscuit Sticks','en'),
('a_imp_dany-handsfree_aeef6db8895c','imp_dany-handsfree','Dany Handsfree','en'),
('a_imp_dany-power-bank_dc502d9a2c4a','imp_dany-power-bank','Dany Power Bank','en'),
('a_imp_dany-tws-earbuds_73dfb7566b09','imp_dany-tws-earbuds','Dany TWS Earbuds','en'),
('a_imp_dawlance-cooking-range_a2403a197cb9','imp_dawlance-cooking-range','Dawlance Cooking Range','en'),
('a_imp_dawlance-deep-freezer_74fd0e427ab7','imp_dawlance-deep-freezer','Dawlance Deep Freezer','en'),
('a_imp_dawlance-french-door-refrigerator_22cb79105abd','imp_dawlance-french-door-refrigerator','Dawlance French Door Refrigerator','en'),
('a_imp_dawlance-front-load-automatic-washing-machine_13beb5f84a5a','imp_dawlance-front-load-automatic-washing-machine','Dawlance Front Load Automatic Washing Machine','en'),
('a_imp_dawlance-inverter-air-conditioner_9ec23e5c816c','imp_dawlance-inverter-air-conditioner','Dawlance Inverter Air Conditioner','en'),
('a_imp_dawlance-inverter-refrigerator_e1a44980b784','imp_dawlance-inverter-refrigerator','Dawlance Inverter Refrigerator','en'),
('a_imp_dawlance-led-tv_3555e93b4057','imp_dawlance-led-tv','Dawlance LED TV','en'),
('a_imp_dawlance-microwave-oven_d0f9d8ee26e3','imp_dawlance-microwave-oven','Dawlance Microwave Oven','en'),
('a_imp_dawlance-side-by-side-refrigerator_af11dcf1e8c7','imp_dawlance-side-by-side-refrigerator','Dawlance Side-by-Side Refrigerator','en'),
('a_imp_dawlance-split-air-conditioner_20bad82f788c','imp_dawlance-split-air-conditioner','Dawlance Split Air Conditioner','en'),
('a_imp_dawlance-top-load-automatic-washing-machine_70d6963f9c84','imp_dawlance-top-load-automatic-washing-machine','Dawlance Top Load Automatic Washing Machine','en'),
('a_imp_dawn-milky-bread_223f27d0c903','imp_dawn-milky-bread','Dawn Milky Bread','en'),
('a_imp_dawn-whole-wheat-bread_73061412dd0f','imp_dawn-whole-wheat-bread','Dawn Whole Wheat Bread','en'),
('a_imp_dell-desktop-pc_3c0d8ea0e1e2','imp_dell-desktop-pc','Dell Desktop PC','en'),
('a_imp_dell-inspiron-15_c1652a3b6818','imp_dell-inspiron-15','Dell Inspiron 15','en'),
('a_imp_dell-latitude_a36dfbbf796e','imp_dell-latitude','Dell Latitude','en'),
('a_imp_dell-monitor_62bc23800584','imp_dell-monitor','Dell Monitor','en'),
('a_imp_dell-vostro_c0c091690d1e','imp_dell-vostro','Dell Vostro','en'),
('a_imp_dell-xps_4b01fecc9aae','imp_dell-xps','Dell XPS','en'),
('a_imp_dettol-dettol-antiseptic-liquid_cf302905e313','imp_dettol-dettol-antiseptic-liquid','Dettol Antiseptic Liquid 250ml','en'),
('a_imp_dettol-dettol-cool-liquid-handwash_8cebffe832f2','imp_dettol-dettol-cool-liquid-handwash','Dettol Cool Liquid Handwash 200ml','en'),
('a_imp_dettol-dettol-cool-soap_38f65d837e5b','imp_dettol-dettol-cool-soap','Dettol Cool Soap','en'),
('a_imp_dettol-dettol-original-liquid-handwash_92846bfed687','imp_dettol-dettol-original-liquid-handwash','Dettol Original Liquid Handwash 200ml','en'),
('a_imp_dettol-dettol-original-soap_7d674954a3a5','imp_dettol-dettol-original-soap','Dettol Original Soap','en'),
('a_imp_dettol-dettol-shaving-cream-fresh_0e0a7db45918','imp_dettol-dettol-shaving-cream-fresh','Dettol Shaving Cream Fresh 78g','en'),
('a_imp_dettol-dettol-skincare-liquid-handwash_175aa45bbb1d','imp_dettol-dettol-skincare-liquid-handwash','Dettol Skincare Liquid Handwash 200ml','en'),
('a_imp_dettol-dettol-skincare-soap_3688a499f3ae','imp_dettol-dettol-skincare-soap','Dettol Skincare Soap','en'),
('a_imp_dfsk-glory-580_6eb1120fa332','imp_dfsk-glory-580','DFSK Glory 580','en'),
('a_imp_dfsk-glory-580-pro_dd54895ca81f','imp_dfsk-glory-580-pro','DFSK Glory 580 Pro','en'),
('a_imp_domex-domex-fresh-guard-toilet-cleaner_71474e2bf59c','imp_domex-domex-fresh-guard-toilet-cleaner','Domex Fresh Guard Toilet Cleaner','en'),
('a_imp_dove-dove-beauty-bar-original_f436d4cad40d','imp_dove-dove-beauty-bar-original','Dove Beauty Bar Original','en'),
('a_imp_dove-dove-daily-shine-shampoo_83028e502400','imp_dove-dove-daily-shine-shampoo','Dove Daily Shine Shampoo','en'),
('a_imp_dove-dove-hair-fall-rescue-conditioner_7a8f47ad75a2','imp_dove-dove-hair-fall-rescue-conditioner','Dove Hair Fall Rescue Conditioner','en'),
('a_imp_dove-dove-hair-fall-rescue-shampoo_b7e4b2e76930','imp_dove-dove-hair-fall-rescue-shampoo','Dove Hair Fall Rescue Shampoo','en'),
('a_imp_dove-dove-intense-repair-conditioner_ad9008157d5f','imp_dove-dove-intense-repair-conditioner','Dove Intense Repair Conditioner','en'),
('a_imp_dove-dove-intense-repair-shampoo_4506e6835861','imp_dove-dove-intense-repair-shampoo','Dove Intense Repair Shampoo','en'),
('a_imp_dunlop-enasave_21b80b626d6b','imp_dunlop-enasave','Dunlop Enasave','en'),
('a_imp_dunlop-grandtrek_fd0bb1c5fe14','imp_dunlop-grandtrek','Dunlop Grandtrek','en'),
('a_imp_dunlop-sp-sport_519ba3071bf2','imp_dunlop-sp-sport','Dunlop SP Sport','en'),
('a_imp_ecostar-inverter-ac_8ec9836012e6','imp_ecostar-inverter-ac','EcoStar Inverter AC','en'),
('a_imp_ecostar-led-tv_f5b0eab267b9','imp_ecostar-led-tv','EcoStar LED TV','en'),
('a_imp_ecostar-refrigerator_ca0e3e0cb105','imp_ecostar-refrigerator','EcoStar Refrigerator','en'),
('a_imp_epson-ecotank-printer_64eb7165e580','imp_epson-ecotank-printer','Epson EcoTank Printer','en'),
('a_imp_euro-cake-euro-cake_1b2f1e03a816','imp_euro-cake-euro-cake','Euro Cake','en'),
('a_imp_eva-cooking-oil_72979c14e37a','imp_eva-cooking-oil','Eva Cooking Oil 5L','en'),
('a_imp_evion-evion-vitamin-e_ccdd8f21451d','imp_evion-evion-vitamin-e','Evion Vitamin E','en'),
('a_imp_exide-mf-100_722ce3cb48d9','imp_exide-mf-100','Exide MF 100','en'),
('a_imp_exide-mf-55l_dfb63d785925','imp_exide-mf-55l','Exide MF 55L','en'),
('a_imp_exide-mf-65l_5af4b42bd4c8','imp_exide-mf-65l','Exide MF 65L','en'),
('a_imp_exide-mf-75l_1ef04d5025b2','imp_exide-mf-75l','Exide MF 75L','en'),
('a_imp_exide-n-70_8fb5960999de','imp_exide-n-70','Exide N 70','en'),
('a_imp_faiza-faiza-beauty-cream_f3e49148f35b','imp_faiza-faiza-beauty-cream','Faiza Beauty Cream','en'),
('a_imp_falcon-super-kernel-basmati-rice_05d763341cab','imp_falcon-super-kernel-basmati-rice','Falcon Super Kernel Basmati Rice 5kg','en'),
('a_imp_fanta-fanta-orange_0e471f50d136','imp_fanta-fanta-orange','Fanta Orange 500ml','en'),
('a_imp_fauji-corn-flakes_b91d03858a6b','imp_fauji-corn-flakes','Fauji Corn Flakes','en'),
('a_imp_faw-v2_b3164b7aedf4','imp_faw-v2','FAW V2','en'),
('a_imp_ferrero-ferrero-rocher_5a18680b0fe8','imp_ferrero-ferrero-rocher','Ferrero Rocher','en'),
('a_imp_ferrero-nutella-chocolate-hazelnut-spread_b6aa2c78316f','imp_ferrero-nutella-chocolate-hazelnut-spread','Ferrero Nutella Chocolate Hazelnut Spread','en'),
('a_imp_fiat-480_da9192397693','imp_fiat-480','Fiat 480','en'),
('a_imp_fiat-640_bac44780b371','imp_fiat-640','Fiat 640','en'),
('a_imp_formula-1-carnauba-wax_16541c566c39','imp_formula-1-carnauba-wax','Formula 1 Carnauba Wax','en'),
('a_imp_formula-1-wash-wax_8d130cb02016','imp_formula-1-wash-wax','Formula 1 Wash & Wax','en'),
('a_imp_general-tyre-bg-falcon_34073bd76a50','imp_general-tyre-bg-falcon','General Tyre BG Falcon','en'),
('a_imp_general-tyre-bg-luxo-plus_c9b636e1d7b8','imp_general-tyre-bg-luxo-plus','General Tyre BG Luxo Plus','en'),
('a_imp_general-tyre-bg-tempo-plus_c6113424481c','imp_general-tyre-bg-tempo-plus','General Tyre BG Tempo Plus','en'),
('a_imp_general-tyre-bg-thunder-max_0dfdfc906ef4','imp_general-tyre-bg-thunder-max','General Tyre BG Thunder Max','en'),
('a_imp_general-tyre-bg-traker_560ee855251c','imp_general-tyre-bg-traker','General Tyre BG Traker','en'),
('a_imp_general-tyre-euro-glide_6996151b8709','imp_general-tyre-euro-glide','General Tyre Euro Glide','en'),
('a_imp_general-tyre-euro-kompact_5fb8e0366287','imp_general-tyre-euro-kompact','General Tyre Euro Kompact','en')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.item_aliases (id,item_id,alias,language) VALUES
('a_imp_general-tyre-euro-kruze_cf5604ab9d42','imp_general-tyre-euro-kruze','General Tyre Euro Kruze','en'),
('a_imp_general-tyre-euro-star_410bdc354ce7','imp_general-tyre-euro-star','General Tyre Euro Star','en'),
('a_imp_general-tyre-euro-tycoon_e8ef699adcbc','imp_general-tyre-euro-tycoon','General Tyre Euro Tycoon','en'),
('a_imp_general-tyre-xp-2000-ii_b442f1e4060e','imp_general-tyre-xp-2000-ii','General Tyre XP 2000 II','en'),
('a_imp_generic-extension-board_76f409639395','imp_generic-extension-board','Generic Extension Board','en'),
('a_imp_generic-mobile-phone-stand_91099f798704','imp_generic-mobile-phone-stand','Generic Mobile Phone Stand','en'),
('a_imp_generic-otg-adapter-cable_1bb9290cf8e4','imp_generic-otg-adapter-cable','Generic OTG Adapter Cable','en'),
('a_imp_generic-silicone-back-cover_7a3fe2ae6e49','imp_generic-silicone-back-cover','Generic Silicone Back Cover','en'),
('a_imp_generic-tempered-glass-screen-protector_192a72a10ebb','imp_generic-tempered-glass-screen-protector','Generic Tempered Glass Screen Protector','en'),
('a_imp_getz-gabica_9875e7e115aa','imp_getz-gabica','Getz Gabica','en'),
('a_imp_getz-montika_e5900c7edc0a','imp_getz-montika','Getz Montika','en'),
('a_imp_getz-onseron_b27a569dd2a6','imp_getz-onseron','Getz Onseron','en'),
('a_imp_getz-rigix_9c956c6a64ca','imp_getz-rigix','Getz Rigix','en'),
('a_imp_getz-risek_9b7c4603b0ba','imp_getz-risek','Getz Risek','en'),
('a_imp_gfc-ceiling-fan_0b4ada2bf4c9','imp_gfc-ceiling-fan','GFC Ceiling Fan','en'),
('a_imp_gfc-exhaust-fan_dac334d6ddb0','imp_gfc-exhaust-fan','GFC Exhaust Fan','en'),
('a_imp_gfc-inverter-ceiling-fan_812ff4122930','imp_gfc-inverter-ceiling-fan','GFC Inverter Ceiling Fan','en'),
('a_imp_gfc-pedestal-fan_76d95869b5a5','imp_gfc-pedestal-fan','GFC Pedestal Fan','en'),
('a_imp_gillette-gillette-mach3-razor_0f97134e50d0','imp_gillette-gillette-mach3-razor','Gillette Mach3 Razor','en'),
('a_imp_glow-lovely-glow-lovely-advanced-multivitamin-cr_eab685045e6d','imp_glow-lovely-glow-lovely-advanced-multivitamin-cr','Glow & Lovely Advanced Multivitamin Cream','en'),
('a_imp_golden-pearl-golden-pearl-beauty-cream_af3e4a6659ba','imp_golden-pearl-golden-pearl-beauty-cream','Golden Pearl Beauty Cream','en'),
('a_imp_good-milk-pasteurized-milk_6fccd35fd1fd','imp_good-milk-pasteurized-milk','Good Milk Pasteurized Milk 1L','en'),
('a_imp_gourmet-gourmet-cola_333d13d62219','imp_gourmet-gourmet-cola','Gourmet Cola','en'),
('a_imp_gourmet-gourmet-water_449c7f0c5c5c','imp_gourmet-gourmet-water','Gourmet Water 500ml','en'),
('a_imp_gree-floor-standing-air-conditioner_057c7ea1491a','imp_gree-floor-standing-air-conditioner','Gree Floor Standing Air Conditioner','en'),
('a_imp_gree-lomo-inverter-ac_a0dfafbccf60','imp_gree-lomo-inverter-ac','Gree Lomo Inverter AC','en'),
('a_imp_gree-split-air-conditioner_c8ae95b7ef0f','imp_gree-split-air-conditioner','Gree Split Air Conditioner','en'),
('a_imp_gsk-avamys_dfad3187764e','imp_gsk-avamys','GSK Avamys','en'),
('a_imp_gsk-bactroban_56ab73df97bb','imp_gsk-bactroban','GSK Bactroban','en'),
('a_imp_gsk-beconase_98342913f3a1','imp_gsk-beconase','GSK Beconase','en'),
('a_imp_gsk-becotide_6ca7371e85ca','imp_gsk-becotide','GSK Becotide','en'),
('a_imp_gsk-betnovate_06129e381c95','imp_gsk-betnovate','GSK Betnovate','en'),
('a_imp_gsk-betnovate-c_bc74e96ab69f','imp_gsk-betnovate-c','GSK Betnovate-C','en'),
('a_imp_gsk-betnovate-n_2ed7accb72ca','imp_gsk-betnovate-n','GSK Betnovate-N','en'),
('a_imp_gsk-calpol_74fce10dd150','imp_gsk-calpol','GSK Calpol','en'),
('a_imp_gsk-celin-vitamin-c_d29f47d99388','imp_gsk-celin-vitamin-c','GSK Celin Vitamin C','en'),
('a_imp_gsk-corsodyl_31842067f6ba','imp_gsk-corsodyl','GSK Corsodyl','en'),
('a_imp_gsk-dermovate_fa75ab093442','imp_gsk-dermovate','GSK Dermovate','en'),
('a_imp_gsk-eno_ea11fb0dd965','imp_gsk-eno','GSK Eno','en'),
('a_imp_gsk-flixonase_e0e30a823f7b','imp_gsk-flixonase','GSK Flixonase','en'),
('a_imp_gsk-flixotide_132b7aa71bb8','imp_gsk-flixotide','GSK Flixotide','en'),
('a_imp_gsk-glaxose-d_51674ea51903','imp_gsk-glaxose-d','GSK Glaxose-D','en'),
('a_imp_gsk-imigran_134d59372663','imp_gsk-imigran','GSK Imigran','en'),
('a_imp_gsk-panadol_1c24ba77e065','imp_gsk-panadol','GSK Panadol','en'),
('a_imp_gsk-panadol-extra_640112555ff4','imp_gsk-panadol-extra','GSK Panadol Extra','en'),
('a_imp_gsk-polyfax_96185d99ff2d','imp_gsk-polyfax','GSK Polyfax','en'),
('a_imp_gsk-seretide_b026b89f4332','imp_gsk-seretide','GSK Seretide','en'),
('a_imp_gsk-serevent_d077e176d26b','imp_gsk-serevent','GSK Serevent','en'),
('a_imp_gsk-sinutab_95fb0bec7bad','imp_gsk-sinutab','GSK Sinutab','en'),
('a_imp_gsk-ventolin_53c869360efd','imp_gsk-ventolin','GSK Ventolin','en'),
('a_imp_gsk-zentel_0e656dbb33fb','imp_gsk-zentel','GSK Zentel','en'),
('a_imp_gsk-zofran_64e8c9506f53','imp_gsk-zofran','GSK Zofran','en'),
('a_imp_gsk-zyloric_ff3534d5300a','imp_gsk-zyloric','GSK Zyloric','en'),
('a_imp_guard-super-kernel-basmati-rice_26d6ee26aca9','imp_guard-super-kernel-basmati-rice','Guard Super Kernel Basmati Rice 5kg','en'),
('a_imp_habib-banaspati_d3ada876ac4f','imp_habib-banaspati','Habib Banaspati 5kg','en'),
('a_imp_habib-cooking-oil_ee9f7cfed9c4','imp_habib-cooking-oil','Habib Cooking Oil 5L','en'),
('a_imp_haier-deep-freezer_2adea0e70366','imp_haier-deep-freezer','Haier Deep Freezer','en'),
('a_imp_haier-front-load-automatic-washing-machine_80a299037337','imp_haier-front-load-automatic-washing-machine','Haier Front Load Automatic Washing Machine','en'),
('a_imp_haier-inverter-air-conditioner_ff5303e0c4eb','imp_haier-inverter-air-conditioner','Haier Inverter Air Conditioner','en'),
('a_imp_haier-inverter-refrigerator_341237599f07','imp_haier-inverter-refrigerator','Haier Inverter Refrigerator','en'),
('a_imp_haier-led-smart-tv_949028bba3c7','imp_haier-led-smart-tv','Haier LED Smart TV','en'),
('a_imp_haier-microwave-oven_46bae66f4570','imp_haier-microwave-oven','Haier Microwave Oven','en'),
('a_imp_haier-side-by-side-refrigerator_b0363d318b48','imp_haier-side-by-side-refrigerator','Haier Side-by-Side Refrigerator','en'),
('a_imp_haier-split-air-conditioner_839ffe46c22a','imp_haier-split-air-conditioner','Haier Split Air Conditioner','en'),
('a_imp_haier-top-load-automatic-washing-machine_e48ba1aa5ed7','imp_haier-top-load-automatic-washing-machine','Haier Top Load Automatic Washing Machine','en'),
('a_imp_haier-twin-tub-washing-machine_bde7053de2c3','imp_haier-twin-tub-washing-machine','Haier Twin Tub Washing Machine','en'),
('a_imp_haleeb-milk_d38bd5079b44','imp_haleeb-milk','Haleeb Milk 1L','en'),
('a_imp_hamdard-joshina_d17da4185581','imp_hamdard-joshina','Hamdard Joshina','en'),
('a_imp_hamdard-rooh-afza_a57177676db9','imp_hamdard-rooh-afza','Hamdard Rooh Afza','en'),
('a_imp_hamdard-sualin_555fa1b14cac','imp_hamdard-sualin','Hamdard Sualin','en'),
('a_imp_hankook-kinergy_d5e0c68dad54','imp_hankook-kinergy','Hankook Kinergy','en'),
('a_imp_hankook-ventus_185d65951157','imp_hankook-ventus','Hankook Ventus','en'),
('a_imp_hansaplast-hansaplast-crepe-bandage_40ecd71a8571','imp_hansaplast-hansaplast-crepe-bandage','Hansaplast Crepe Bandage','en'),
('a_imp_hansaplast-hansaplast-wound-plaster_4534bc39371b','imp_hansaplast-hansaplast-wound-plaster','Hansaplast Wound Plaster','en'),
('a_imp_happy-cow-cheese-slices_b6ecbc6d8814','imp_happy-cow-cheese-slices','Happy Cow Cheese Slices','en'),
('a_imp_happy-cow-cheese-triangles_b149e36480a9','imp_happy-cow-cheese-triangles','Happy Cow Cheese Triangles','en'),
('a_imp_harpic-harpic-bathroom-cleaner_b0e15754da87','imp_harpic-harpic-bathroom-cleaner','Harpic Bathroom Cleaner','en'),
('a_imp_harpic-harpic-power-plus-10x-toilet-cleaner_a88bf2faf970','imp_harpic-harpic-power-plus-10x-toilet-cleaner','Harpic Power Plus 10X Toilet Cleaner','en'),
('a_imp_haval-h6_3748a0a46711','imp_haval-h6','Haval H6','en'),
('a_imp_haval-h6-hev_f87a135e892d','imp_haval-h6-hev','Haval H6 HEV','en'),
('a_imp_haval-jolion_7d9c5c898a4b','imp_haval-jolion','Haval Jolion','en'),
('a_imp_haw-par-tiger-balm_6e35ba1ab3dd','imp_haw-par-tiger-balm','Haw Par Tiger Balm','en'),
('a_imp_head-shoulders-head-shoulders-anti-hairfall-sham_ec51da558fb3','imp_head-shoulders-head-shoulders-anti-hairfall-sham','Head & Shoulders Anti-Hairfall Shampoo','en'),
('a_imp_head-shoulders-head-shoulders-apple-fresh-shampo_cda9d02ac8e3','imp_head-shoulders-head-shoulders-apple-fresh-shampo','Head & Shoulders Apple Fresh Shampoo','en'),
('a_imp_head-shoulders-head-shoulders-cool-menthol-shamp_c0dede687bbf','imp_head-shoulders-head-shoulders-cool-menthol-shamp','Head & Shoulders Cool Menthol Shampoo','en'),
('a_imp_head-shoulders-head-shoulders-lemon-fresh-shampo_4c0b01f4790b','imp_head-shoulders-head-shoulders-lemon-fresh-shampo','Head & Shoulders Lemon Fresh Shampoo','en'),
('a_imp_head-shoulders-head-shoulders-smooth-silky-shamp_8b24583a793c','imp_head-shoulders-head-shoulders-smooth-silky-shamp','Head & Shoulders Smooth & Silky Shampoo','en'),
('a_imp_hemani-hemani-black-seed-oil_0ffec74d93fc','imp_hemani-hemani-black-seed-oil','Hemani Black Seed Oil','en'),
('a_imp_hemani-hemani-coconut-oil_a707c4faf224','imp_hemani-hemani-coconut-oil','Hemani Coconut Oil','en'),
('a_imp_hemani-hemani-rose-water_694047c8941d','imp_hemani-hemani-rose-water','Hemani Rose Water','en'),
('a_imp_hilal-cupkake_cff48b602f23','imp_hilal-cupkake','Hilal CupKake','en'),
('a_imp_hilal-ding-dong_1308305180a3','imp_hilal-ding-dong','Hilal Ding Dong','en'),
('a_imp_hilal-fresh-up_a00247c5e6ac','imp_hilal-fresh-up','Hilal Fresh Up','en'),
('a_imp_hilal-jelly_e4f0a328223e','imp_hilal-jelly','Hilal Jelly','en'),
('a_imp_hilton-enzar-hs_208271d303f4','imp_hilton-enzar-hs','Hilton Enzar HS','en'),
('a_imp_himalaya-himalaya-purifying-neem-face-wash_4e05a0152c24','imp_himalaya-himalaya-purifying-neem-face-wash','Himalaya Purifying Neem Face Wash','en'),
('a_imp_hisense-qled-tv_986c65bf5bca','imp_hisense-qled-tv','Hisense QLED TV','en'),
('a_imp_hisense-smart-tv_f5ea6bf4b0ca','imp_hisense-smart-tv','Hisense Smart TV','en'),
('a_imp_honda-accord_7a518aef4b85','imp_honda-accord','Honda Accord','en'),
('a_imp_honda-br-v_2597334a0e6e','imp_honda-br-v','Honda BR-V','en'),
('a_imp_honda-cb-125f_a43ce6245658','imp_honda-cb-125f','Honda CB 125F','en'),
('a_imp_honda-cb-150f_490605ff9f06','imp_honda-cb-150f','Honda CB 150F','en'),
('a_imp_honda-cd-100_9d60faf49c96','imp_honda-cd-100','Honda CD 100','en'),
('a_imp_honda-cd-70_4fc69b285680','imp_honda-cd-70','Honda CD 70','en'),
('a_imp_honda-cd-70-dream_c299aeef5a4c','imp_honda-cd-70-dream','Honda CD 70 Dream','en'),
('a_imp_honda-cg-125_41cb21712c63','imp_honda-cg-125','Honda CG 125','en'),
('a_imp_honda-cg-125s_c40389f6a99e','imp_honda-cg-125s','Honda CG 125S','en'),
('a_imp_honda-city-1-2_5e624cec83d4','imp_honda-city-1-2','Honda City 1.2','en'),
('a_imp_honda-city-1-3_d5a0e711c6be','imp_honda-city-1-3','Honda City 1.3','en'),
('a_imp_honda-city-1-5_6813ddd8bef8','imp_honda-city-1-5','Honda City 1.5','en'),
('a_imp_honda-city-aspire_654e731ec689','imp_honda-city-aspire','Honda City Aspire','en'),
('a_imp_honda-city-aspire-s_f4586f6031dd','imp_honda-city-aspire-s','Honda City Aspire S','en'),
('a_imp_honda-city-vario_fc0b106b72a0','imp_honda-city-vario','Honda City Vario','en'),
('a_imp_honda-civic-oriel_cae6538ade1a','imp_honda-civic-oriel','Honda Civic Oriel','en'),
('a_imp_honda-civic-rs_10531bd46f7a','imp_honda-civic-rs','Honda Civic RS','en'),
('a_imp_honda-civic-rs-turbo_1fd6210bb9e2','imp_honda-civic-rs-turbo','Honda Civic RS Turbo','en'),
('a_imp_honda-civic-vti_e0772546bec7','imp_honda-civic-vti','Honda Civic VTi','en'),
('a_imp_honda-cr-v_83fa6e02bdc9','imp_honda-cr-v','Honda CR-V','en'),
('a_imp_honda-fit_dae1a1198e6e','imp_honda-fit','Honda Fit','en'),
('a_imp_honda-hr-v_ca074e6e1a26','imp_honda-hr-v','Honda HR-V','en'),
('a_imp_honda-pridor_ab7cda4cf260','imp_honda-pridor','Honda Pridor','en'),
('a_imp_honda-vezel_0fcfc7d9b64e','imp_honda-vezel','Honda Vezel','en'),
('a_imp_honor-200_88b4a37500d7','imp_honor-200','Honor 200','en'),
('a_imp_honor-pad-x9_2400a3db99ba','imp_honor-pad-x9','Honor Pad X9','en'),
('a_imp_honor-x6b_1f04386d7a2e','imp_honor-x6b','Honor X6b','en'),
('a_imp_honor-x7b_6fe43301bd6e','imp_honor-x7b','Honor X7b','en'),
('a_imp_honor-x9b_ded828dfa150','imp_honor-x9b','Honor X9b','en'),
('a_imp_horlicks-horlicks-health-drink_57b7f1345ab3','imp_horlicks-horlicks-health-drink','Horlicks Health Drink','en'),
('a_imp_hp-all-in-one-pc_339021208697','imp_hp-all-in-one-pc','HP All-in-One PC','en'),
('a_imp_hp-elitebook_68d1b9df13a1','imp_hp-elitebook','HP EliteBook','en'),
('a_imp_hp-laserjet-printer_2e0244e75bd8','imp_hp-laserjet-printer','HP LaserJet Printer','en'),
('a_imp_hp-monitor_8f8aaf133170','imp_hp-monitor','HP Monitor','en'),
('a_imp_hp-pavilion-15_b8a2d5bdb33c','imp_hp-pavilion-15','HP Pavilion 15','en'),
('a_imp_hp-probook_dedf4b2143b3','imp_hp-probook','HP ProBook','en'),
('a_imp_hp-victus_0ce1d59823a5','imp_hp-victus','HP Victus','en'),
('a_imp_hp-wireless-mouse_842ff80c287a','imp_hp-wireless-mouse','HP Wireless Mouse','en'),
('a_imp_hydrozole-hydrozole-cream_00504c6ebd0b','imp_hydrozole-hydrozole-cream','Hydrozole Cream','en'),
('a_imp_hyundai-elantra-gl_72878bbce463','imp_hyundai-elantra-gl','Hyundai Elantra GL','en'),
('a_imp_hyundai-elantra-gls_e21a7a6e7346','imp_hyundai-elantra-gls','Hyundai Elantra GLS','en'),
('a_imp_hyundai-excel_1c06ead47f2f','imp_hyundai-excel','Hyundai Excel','en'),
('a_imp_hyundai-porter_9d4d098be159','imp_hyundai-porter','Hyundai Porter','en'),
('a_imp_hyundai-santro_a124d37db092','imp_hyundai-santro','Hyundai Santro','en'),
('a_imp_hyundai-shehzore_147524cc9f63','imp_hyundai-shehzore','Hyundai Shehzore','en'),
('a_imp_hyundai-sonata_3c0e0bc4c20e','imp_hyundai-sonata','Hyundai Sonata','en'),
('a_imp_hyundai-tucson-gls_949071413fa0','imp_hyundai-tucson-gls','Hyundai Tucson GLS','en'),
('a_imp_hyundai-tucson-sport_647e7c936899','imp_hyundai-tucson-sport','Hyundai Tucson Sport','en'),
('a_imp_hyundai-tucson-ultimate_ec1a9fffa0b1','imp_hyundai-tucson-ultimate','Hyundai Tucson Ultimate','en'),
('a_imp_infinix-gt-20-pro_387cb2b8f849','imp_infinix-gt-20-pro','Infinix GT 20 Pro','en'),
('a_imp_infinix-hot-30i_9ed314edd330','imp_infinix-hot-30i','Infinix Hot 30i','en'),
('a_imp_infinix-hot-40_8b8b46209176','imp_infinix-hot-40','Infinix Hot 40','en'),
('a_imp_infinix-hot-40-pro_a8ad73dcf2b1','imp_infinix-hot-40-pro','Infinix Hot 40 Pro','en'),
('a_imp_infinix-hot-40i_153a8a621c30','imp_infinix-hot-40i','Infinix Hot 40i','en'),
('a_imp_infinix-note-30_ffe6e5fd52fe','imp_infinix-note-30','Infinix Note 30','en'),
('a_imp_infinix-note-40_74c044e8beb9','imp_infinix-note-40','Infinix Note 40','en'),
('a_imp_infinix-note-40-pro_e7af73a5c8b3','imp_infinix-note-40-pro','Infinix Note 40 Pro','en'),
('a_imp_infinix-smart-8_1c3dfc403a89','imp_infinix-smart-8','Infinix Smart 8','en'),
('a_imp_infinix-zero-30_2939e4a1c736','imp_infinix-zero-30','Infinix Zero 30','en'),
('a_imp_innovative-chocolate-chip-cookies_766699413efd','imp_innovative-chocolate-chip-cookies','Innovative Chocolate Chip Cookies','en'),
('a_imp_isuzu-d-max_17e1c205ddcc','imp_isuzu-d-max','Isuzu D-Max','en'),
('a_imp_itel-a60_90964b63ffe2','imp_itel-a60','Itel A60','en'),
('a_imp_itel-a70_8170e704ae0b','imp_itel-a70','Itel A70','en'),
('a_imp_itel-p55_7156bbec5bab','imp_itel-p55','Itel P55','en'),
('a_imp_itel-s23_4d9374f3db96','imp_itel-s23','Itel S23','en'),
('a_imp_itel-s24_1a2b7d7e5f1c','imp_itel-s24','Itel S24','en'),
('a_imp_janssen-imodium_9455632476d8','imp_janssen-imodium','Janssen Imodium','en'),
('a_imp_janssen-motilium_041e3b2b1660','imp_janssen-motilium','Janssen Motilium','en'),
('a_imp_janssen-pariet_223de70bd3b1','imp_janssen-pariet','Janssen Pariet','en'),
('a_imp_janssen-sibelium_40c772b2231f','imp_janssen-sibelium','Janssen Sibelium','en'),
('a_imp_janssen-vermox_41580474bec2','imp_janssen-vermox','Janssen Vermox','en'),
('a_imp_jbl-charge-5_a16aad572112','imp_jbl-charge-5','JBL Charge 5','en'),
('a_imp_jbl-flip-6_f4f246a58931','imp_jbl-flip-6','JBL Flip 6','en'),
('a_imp_jbl-go-3_c00564451933','imp_jbl-go-3','JBL Go 3','en'),
('a_imp_jbl-partybox-110_49e53bea16b3','imp_jbl-partybox-110','JBL PartyBox 110','en'),
('a_imp_jbl-tune-510bt_2b3438769a4c','imp_jbl-tune-510bt','JBL Tune 510BT','en'),
('a_imp_jbl-tune-720bt_b0b37be0f48b','imp_jbl-tune-720bt','JBL Tune 720BT','en'),
('a_imp_jbl-wave-buds_4db240dcc09b','imp_jbl-wave-buds','JBL Wave Buds','en'),
('a_imp_johnson-johnson-microlax_8e201da55896','imp_johnson-johnson-microlax','Johnson & Johnson Microlax','en'),
('a_imp_johnson-s-johnson-s-baby-cream_99597dd405e0','imp_johnson-s-johnson-s-baby-cream','Johnson''s Baby Cream','en'),
('a_imp_johnson-s-johnson-s-baby-lotion_3ff2121e4680','imp_johnson-s-johnson-s-baby-lotion','Johnson''s Baby Lotion','en'),
('a_imp_johnson-s-johnson-s-baby-oil_356de63149ab','imp_johnson-s-johnson-s-baby-oil','Johnson''s Baby Oil','en'),
('a_imp_johnson-s-johnson-s-baby-powder_5ae9ee7f4bbe','imp_johnson-s-johnson-s-baby-powder','Johnson''s Baby Powder','en'),
('a_imp_johnson-s-johnson-s-baby-shampoo_85e94f7d425d','imp_johnson-s-johnson-s-baby-shampoo','Johnson''s Baby Shampoo','en'),
('a_imp_johnson-s-johnson-s-baby-soap_f0dfbefda921','imp_johnson-s-johnson-s-baby-soap','Johnson''s Baby Soap','en'),
('a_imp_johnson-s-johnson-s-baby-wipes_ec5111c62c99','imp_johnson-s-johnson-s-baby-wipes','Johnson''s Baby Wipes','en'),
('a_imp_johnson-s-johnson-s-cotton-buds_39d2141f0089','imp_johnson-s-johnson-s-cotton-buds','Johnson''s Cotton Buds','en'),
('a_imp_jojo-bisko-balls-chocolate-coated-biscuits_5e059eb3bf6b','imp_jojo-bisko-balls-chocolate-coated-biscuits','Jojo Bisko Balls Chocolate Coated Biscuits','en'),
('a_imp_k-n-s-chapli-kabab_a0b5c6a73939','imp_k-n-s-chapli-kabab','K&N''s Chapli Kabab','en'),
('a_imp_k-n-s-chicken-burger-patty_f9340345de7d','imp_k-n-s-chicken-burger-patty','K&N''s Chicken Burger Patty','en'),
('a_imp_k-n-s-chicken-nuggets_7f3ca9886d4a','imp_k-n-s-chicken-nuggets','K&N''s Chicken Nuggets','en'),
('a_imp_k-n-s-chicken-samosa_94c3b6e9840e','imp_k-n-s-chicken-samosa','K&N''s Chicken Samosa','en'),
('a_imp_k-n-s-chicken-strips_5f184d3d0775','imp_k-n-s-chicken-strips','K&N''s Chicken Strips','en'),
('a_imp_k-n-s-chicken-tempura_95f4d13dcb58','imp_k-n-s-chicken-tempura','K&N''s Chicken Tempura','en'),
('a_imp_k-n-s-hot-wings_cacb03dd4893','imp_k-n-s-hot-wings','K&N''s Hot Wings','en'),
('a_imp_k-n-s-kofta_02a70c220c29','imp_k-n-s-kofta','K&N''s Kofta','en'),
('a_imp_k-n-s-seekh-kabab_249dc2e856de','imp_k-n-s-seekh-kabab','K&N''s Seekh Kabab','en'),
('a_imp_k-n-s-shami-kabab_afcfdc2a9abd','imp_k-n-s-shami-kabab','K&N''s Shami Kabab','en'),
('a_imp_k-n-s-spring-rolls_c8c9018f25a7','imp_k-n-s-spring-rolls','K&N''s Spring Rolls','en'),
('a_imp_k-n-s-tender-pops_e9dc770a96df','imp_k-n-s-tender-pops','K&N''s Tender Pops','en'),
('a_imp_kashmir-banaspati_2e0d1597a301','imp_kashmir-banaspati','Kashmir Banaspati 5kg','en'),
('a_imp_kashmir-cooking-oil_0256517c749f','imp_kashmir-cooking-oil','Kashmir Cooking Oil 5L','en'),
('a_imp_kellogg-s-chocos_3be9ff2fb96c','imp_kellogg-s-chocos','Kellogg''s Chocos','en'),
('a_imp_kellogg-s-corn-flakes_26d2f5c76abf','imp_kellogg-s-corn-flakes','Kellogg''s Corn Flakes','en'),
('a_imp_kenacomb-kenacomb-cream_c0f832850c24','imp_kenacomb-kenacomb-cream','Kenacomb Cream','en'),
('a_imp_kenwood-e-smart-inverter-ac_4b8047475114','imp_kenwood-e-smart-inverter-ac','Kenwood E-Smart Inverter AC','en'),
('a_imp_kenwood-food-processor_3b15cc0cffce','imp_kenwood-food-processor','Kenwood Food Processor','en'),
('a_imp_kenwood-inverter-refrigerator_6e4762fa63c2','imp_kenwood-inverter-refrigerator','Kenwood Inverter Refrigerator','en'),
('a_imp_kenwood-microwave-oven_a513dda95ea4','imp_kenwood-microwave-oven','Kenwood Microwave Oven','en'),
('a_imp_kenwood-stand-mixer_a3c15deda5b6','imp_kenwood-stand-mixer','Kenwood Stand Mixer','en'),
('a_imp_kenwood-top-load-automatic-washing-machine_37d9275bd8aa','imp_kenwood-top-load-automatic-washing-machine','Kenwood Top Load Automatic Washing Machine','en'),
('a_imp_kia-carnival_21906bb1fc23','imp_kia-carnival','Kia Carnival','en'),
('a_imp_kia-classic_2bdd5f386e6e','imp_kia-classic','Kia Classic','en'),
('a_imp_kia-picanto-at_c697ed2ed703','imp_kia-picanto-at','Kia Picanto AT','en'),
('a_imp_kia-picanto-mt_c27b3addd505','imp_kia-picanto-mt','Kia Picanto MT','en'),
('a_imp_kia-sorento_833f0faf5a36','imp_kia-sorento','Kia Sorento','en'),
('a_imp_kia-spectra_664d4fc31de4','imp_kia-spectra','Kia Spectra','en'),
('a_imp_kia-sportage-alpha_304001bb8c03','imp_kia-sportage-alpha','Kia Sportage Alpha','en'),
('a_imp_kia-sportage-awd_5e0edc4b188b','imp_kia-sportage-awd','Kia Sportage AWD','en'),
('a_imp_kia-sportage-fwd_ab22db762d60','imp_kia-sportage-fwd','Kia Sportage FWD','en'),
('a_imp_kia-stonic-ex_8ea9d79e488a','imp_kia-stonic-ex','Kia Stonic EX','en'),
('a_imp_kia-stonic-ex-2_b46c41c750a5','imp_kia-stonic-ex-2','Kia Stonic EX+','en'),
('a_imp_kinley-kinley_7879343d4470','imp_kinley-kinley','Kinley 500ml','en'),
('a_imp_kisan-banaspati_1466799550fb','imp_kisan-banaspati','Kisan Banaspati 5kg','en'),
('a_imp_kisan-cooking-oil_0dfe38b9b7a5','imp_kisan-cooking-oil','Kisan Cooking Oil 5L','en'),
('a_imp_kixx-g1_a93999fd35ed','imp_kixx-g1','Kixx G1','en'),
('a_imp_knorr-chicken-corn-soup_4c49f15554d0','imp_knorr-chicken-corn-soup','Knorr Chicken Corn Soup','en'),
('a_imp_knorr-chicken-noodles_23978d97be1a','imp_knorr-chicken-noodles','Knorr Chicken Noodles','en'),
('a_imp_knorr-chicken-stock-cubes_769fc6213f86','imp_knorr-chicken-stock-cubes','Knorr Chicken Stock Cubes','en'),
('a_imp_knorr-chicken-tikka-noodles_18575f1c4a2e','imp_knorr-chicken-tikka-noodles','Knorr Chicken Tikka Noodles','en'),
('a_imp_knorr-hot-sour-soup_55661f2dffae','imp_knorr-hot-sour-soup','Knorr Hot & Sour Soup','en'),
('a_imp_knorr-tomato-ketchup_4fe9ac2a36f2','imp_knorr-tomato-ketchup','Knorr Tomato Ketchup','en'),
('a_imp_knorr-tomato-soup_700b7f3db425','imp_knorr-tomato-soup','Knorr Tomato Soup','en'),
('a_imp_knorr-vegetable-soup_4762fa765234','imp_knorr-vegetable-soup','Knorr Vegetable Soup','en'),
('a_imp_kolson-bravo-milk-cookies_77aedd15f27e','imp_kolson-bravo-milk-cookies','Kolson Bravo Milk Cookies','en'),
('a_imp_kolson-cheese-balls_845469eef648','imp_kolson-cheese-balls','Kolson Cheese Balls','en'),
('a_imp_kolson-chunky-chicken_e1e4512e1cb2','imp_kolson-chunky-chicken','Kolson Chunky Chicken 4 x 65g','en'),
('a_imp_kolson-elbow-macaroni_5eb2cfb229ab','imp_kolson-elbow-macaroni','Kolson Elbow Macaroni 400g','en'),
('a_imp_kolson-fold-bbq-snack_52a354a751ba','imp_kolson-fold-bbq-snack','Kolson Fold BBQ Snack 21g','en'),
('a_imp_kolson-jam-hearts-strawberry-vanilla_7a8d58e3afd6','imp_kolson-jam-hearts-strawberry-vanilla','Kolson Jam Hearts Strawberry & Vanilla','en'),
('a_imp_kolson-lotte-choco-pie_e83ce4ba7fc6','imp_kolson-lotte-choco-pie','Kolson Lotte Choco Pie','en'),
('a_imp_kolson-potato-sticks_81252af8614d','imp_kolson-potato-sticks','Kolson Potato Sticks','en'),
('a_imp_kolson-slanty-jalapeno_5ac6df9db3b6','imp_kolson-slanty-jalapeno','Kolson Slanty Jalapeno 40g','en'),
('a_imp_kolson-slanty-salted_ecbc5bb234ab','imp_kolson-slanty-salted','Kolson Slanty Salted 12 x 13g','en'),
('a_imp_kolson-slanty-vegetable_0fb7f1f01072','imp_kolson-slanty-vegetable','Kolson Slanty Vegetable','en'),
('a_imp_kolson-snackers-french-cheese_95bf2547d3df','imp_kolson-snackers-french-cheese','Kolson Snackers French Cheese 15g x 10','en'),
('a_imp_kolson-snackers-hot-masala_eb997fb31e02','imp_kolson-snackers-hot-masala','Kolson Snackers Hot Masala 15g x 12','en'),
('a_imp_kolson-spaghetti_15e545ea4f87','imp_kolson-spaghetti','Kolson Spaghetti 400g','en'),
('a_imp_kolson-twich-classic_1d24d7006753','imp_kolson-twich-classic','Kolson Twich Classic','en'),
('a_imp_korneez-popcorn-bbq_3862fad52b6c','imp_korneez-popcorn-bbq','Korneez Popcorn BBQ','en'),
('a_imp_korneez-popcorn-salted_4ca119225c4f','imp_korneez-popcorn-salted','Korneez Popcorn Salted','en'),
('a_imp_kurkure-chutney-chaska_05881f0d5fd3','imp_kurkure-chutney-chaska','Kurkure Chutney Chaska 19g','en'),
('a_imp_kurkure-red-chilli-jhatka_eab157537cf8','imp_kurkure-red-chilli-jhatka','Kurkure Red Chilli Jhatka','en'),
('a_imp_kurkure-toofaani-mirch_f4a5aa1a8198','imp_kurkure-toofaani-mirch','Kurkure Toofaani Mirch','en'),
('a_imp_land-rover-range-rover_64fb360aa233','imp_land-rover-range-rover','Land Rover Range Rover','en'),
('a_imp_land-rover-range-rover-sport_ef249782cfed','imp_land-rover-range-rover-sport','Land Rover Range Rover Sport','en'),
('a_imp_langnese-honey_024e27d8b671','imp_langnese-honey','Langnese Honey','en'),
('a_imp_lay-s-masala_b9f552304654','imp_lay-s-masala','Lay''s Masala 29g','en'),
('a_imp_lay-s-salted_b123f559afba','imp_lay-s-salted','Lay''s Salted','en'),
('a_imp_lay-s-wavy-bbq_82944554bce2','imp_lay-s-wavy-bbq','Lay''s Wavy BBQ','en'),
('a_imp_lay-s-wavy-mexican-chili_41155f630aec','imp_lay-s-wavy-mexican-chili','Lay''s Wavy Mexican Chili','en'),
('a_imp_lay-s-yogurt-herb_e5787abdd8bb','imp_lay-s-yogurt-herb','Lay''s Yogurt & Herb','en'),
('a_imp_laziza-firni-mix_bc66e1774b2f','imp_laziza-firni-mix','Laziza Firni Mix','en'),
('a_imp_laziza-gulab-jamun-mix_21cfe51e70d9','imp_laziza-gulab-jamun-mix','Laziza Gulab Jamun Mix','en'),
('a_imp_laziza-kheer-mix_c083ba3a8838','imp_laziza-kheer-mix','Laziza Kheer Mix','en'),
('a_imp_laziza-kulfi-mix_6520fb70fdd8','imp_laziza-kulfi-mix','Laziza Kulfi Mix','en'),
('a_imp_laziza-rasmalai-mix_ab6c27767558','imp_laziza-rasmalai-mix','Laziza Rasmalai Mix','en'),
('a_imp_laziza-royal-falooda-mix_bcf40ab39297','imp_laziza-royal-falooda-mix','Laziza Royal Falooda Mix','en'),
('a_imp_laziza-vanilla-custard-powder_635160ec1180','imp_laziza-vanilla-custard-powder','Laziza Vanilla Custard Powder','en'),
('a_imp_laziza-zarda-mix_aa97571c4947','imp_laziza-zarda-mix','Laziza Zarda Mix','en'),
('a_imp_lemon-max-lemon-max-dishwash-bar_edd45585bdbf','imp_lemon-max-lemon-max-dishwash-bar','Lemon Max Dishwash Bar 290g','en'),
('a_imp_lemon-max-lemon-max-dishwash-liquid_82e40c6c2b3a','imp_lemon-max-lemon-max-dishwash-liquid','Lemon Max Dishwash Liquid','en'),
('a_imp_lenovo-desktop-pc_78452ae1d540','imp_lenovo-desktop-pc','Lenovo Desktop PC','en'),
('a_imp_lenovo-ideapad-slim_2aa7c5356ff5','imp_lenovo-ideapad-slim','Lenovo IdeaPad Slim','en'),
('a_imp_lenovo-legion_536c18780f8a','imp_lenovo-legion','Lenovo Legion','en'),
('a_imp_lenovo-monitor_3b158a9269e0','imp_lenovo-monitor','Lenovo Monitor','en'),
('a_imp_lenovo-tab-m10_9d22ed0ea607','imp_lenovo-tab-m10','Lenovo Tab M10','en'),
('a_imp_lenovo-tab-m11_6b1c57ed3550','imp_lenovo-tab-m11','Lenovo Tab M11','en'),
('a_imp_lenovo-tab-m9_3ff9f684b421','imp_lenovo-tab-m9','Lenovo Tab M9','en'),
('a_imp_lenovo-thinkbook_b33489f29aba','imp_lenovo-thinkbook','Lenovo ThinkBook','en'),
('a_imp_lenovo-thinkpad_66a35879d225','imp_lenovo-thinkpad','Lenovo ThinkPad','en'),
('a_imp_leo-fucicort_501b1e3e3b66','imp_leo-fucicort','Leo Fucicort','en'),
('a_imp_leo-fucidin_89c8215d424d','imp_leo-fucidin','Leo Fucidin','en'),
('a_imp_lexus-rx_3ce741d08825','imp_lexus-rx','Lexus RX','en'),
('a_imp_lg-front-load-automatic-washing-machine_aaa3c7ed4603','imp_lg-front-load-automatic-washing-machine','LG Front Load Automatic Washing Machine','en'),
('a_imp_lg-led-smart-tv_1d93d9ed5a6c','imp_lg-led-smart-tv','LG LED Smart TV','en'),
('a_imp_lg-monitor_4da5af0f8a56','imp_lg-monitor','LG Monitor','en'),
('a_imp_lg-nanocell-tv_6ba795d3092d','imp_lg-nanocell-tv','LG NanoCell TV','en'),
('a_imp_lg-oled-tv_0c5f87fb1b29','imp_lg-oled-tv','LG OLED TV','en'),
('a_imp_lg-top-load-automatic-washing-machine_d18f9fbd24e5','imp_lg-top-load-automatic-washing-machine','LG Top Load Automatic Washing Machine','en'),
('a_imp_lifebuoy-lifebuoy-care-handwash_cdde6d1f9727','imp_lifebuoy-lifebuoy-care-handwash','Lifebuoy Care Handwash 200ml','en'),
('a_imp_lifebuoy-lifebuoy-care-soap_23375202b27d','imp_lifebuoy-lifebuoy-care-soap','Lifebuoy Care Soap','en'),
('a_imp_lifebuoy-lifebuoy-lemon-fresh-handwash_71610d731da3','imp_lifebuoy-lifebuoy-lemon-fresh-handwash','Lifebuoy Lemon Fresh Handwash 200ml','en'),
('a_imp_lifebuoy-lifebuoy-lemon-fresh-soap_ecb2d8b072a0','imp_lifebuoy-lifebuoy-lemon-fresh-soap','Lifebuoy Lemon Fresh Soap','en'),
('a_imp_lifebuoy-lifebuoy-total-10-handwash_0d1767aea66e','imp_lifebuoy-lifebuoy-total-10-handwash','Lifebuoy Total 10 Handwash 200ml','en'),
('a_imp_lifebuoy-lifebuoy-total-10-soap_298c24896c40','imp_lifebuoy-lifebuoy-total-10-soap','Lifebuoy Total 10 Soap','en'),
('a_imp_lipton-green-tea_7589509e2ac6','imp_lipton-green-tea','Lipton Green Tea','en'),
('a_imp_lipton-taaza_42ce2d49d715','imp_lipton-taaza','Lipton Taaza 950g','en'),
('a_imp_lipton-yellow-label_fb5109a85b6f','imp_lipton-yellow-label','Lipton Yellow Label 950g','en'),
('a_imp_lipton-yellow-label-tea_dd8ea82d66e9','imp_lipton-yellow-label-tea','Lipton Yellow Label Tea','en'),
('a_imp_listerine-listerine-cool-mint-mouthwash_4763221bb2bd','imp_listerine-listerine-cool-mint-mouthwash','Listerine Cool Mint Mouthwash','en'),
('a_imp_logitech-wireless-keyboard_1093f32e9937','imp_logitech-wireless-keyboard','Logitech Wireless Keyboard','en'),
('a_imp_logitech-wireless-mouse_1d61edf59d35','imp_logitech-wireless-mouse','Logitech Wireless Mouse','en'),
('a_imp_lu-bakeri_b254464914b2','imp_lu-bakeri','LU Bakeri','en'),
('a_imp_lu-candi_6fe748369c00','imp_lu-candi','LU Candi','en'),
('a_imp_lu-gala-egg-biscuits_043fa1bb7d1b','imp_lu-gala-egg-biscuits','LU Gala Egg Biscuits','en'),
('a_imp_lu-prince-chocolate-sandwich-biscuit_0a4c3b9cfca2','imp_lu-prince-chocolate-sandwich-biscuit','LU Prince Chocolate Sandwich Biscuit','en'),
('a_imp_lu-tiger-glucose-biscuits_e6ce0f7b14e9','imp_lu-tiger-glucose-biscuits','LU Tiger Glucose Biscuits','en'),
('a_imp_lu-tuc_ddfebc286b1b','imp_lu-tuc','LU TUC','en'),
('a_imp_lux-lux-dreamy-delight-beauty-soap_443312f51581','imp_lux-lux-dreamy-delight-beauty-soap','Lux Dreamy Delight Beauty Soap','en'),
('a_imp_lux-lux-soft-touch-beauty-soap_720cdfedaf9a','imp_lux-lux-soft-touch-beauty-soap','Lux Soft Touch Beauty Soap','en'),
('a_imp_lux-lux-velvet-touch-beauty-soap_d2dc9d03b339','imp_lux-lux-velvet-touch-beauty-soap','Lux Velvet Touch Beauty Soap','en'),
('a_imp_maggi-2-minute-masala-noodles_a17c6f3506c5','imp_maggi-2-minute-masala-noodles','Maggi 2-Minute Masala Noodles','en'),
('a_imp_marhaba-honey_087b8331253d','imp_marhaba-honey','Marhaba Honey','en'),
('a_imp_marhaba-isabgol_8a2524e294ed','imp_marhaba-isabgol','Marhaba Isabgol','en'),
('a_imp_mars-snickers_640fae6f391d','imp_mars-snickers','Mars Snickers','en'),
('a_imp_massey-ferguson-240_1bd9bce1a9c5','imp_massey-ferguson-240','Massey Ferguson 240','en'),
('a_imp_massey-ferguson-260_e35219ffb5d3','imp_massey-ferguson-260','Massey Ferguson 260','en'),
('a_imp_massey-ferguson-360_02bfd1463cfb','imp_massey-ferguson-360','Massey Ferguson 360','en'),
('a_imp_massey-ferguson-375_6e3fc0e75eff','imp_massey-ferguson-375','Massey Ferguson 375','en'),
('a_imp_massey-ferguson-385_f7931453ca45','imp_massey-ferguson-385','Massey Ferguson 385','en'),
('a_imp_massey-ferguson-385-4wd_854325cf6990','imp_massey-ferguson-385-4wd','Massey Ferguson 385 4WD','en'),
('a_imp_mayfair-cafe-khatai-style-biscuit_2628d87ee8a2','imp_mayfair-cafe-khatai-style-biscuit','Mayfair Cafe Khatai Style Biscuit','en'),
('a_imp_mayfair-cofied_a9d44fd810fc','imp_mayfair-cofied','Mayfair Cofied','en'),
('a_imp_mayfair-minto_a9e3aea8e55f','imp_mayfair-minto','Mayfair Minto','en'),
('a_imp_medora-medora-lipstick_ced2794403e1','imp_medora-medora-lipstick','Medora Lipstick','en'),
('a_imp_medora-medora-nail-polish_e2e5068fec69','imp_medora-medora-nail-polish','Medora Nail Polish','en'),
('a_imp_mehran-chapli-kabab_eef1349f3cae','imp_mehran-chapli-kabab','Mehran Chapli Kabab 50g','en'),
('a_imp_mehran-chicken-biryani_cca6ae38469f','imp_mehran-chicken-biryani','Mehran Chicken Biryani 50g','en'),
('a_imp_mehran-chicken-chapli-kabab_37673abe19e1','imp_mehran-chicken-chapli-kabab','Mehran Chicken Chapli Kabab 50g','en'),
('a_imp_mehran-chicken-pulao_7f70308e34f8','imp_mehran-chicken-pulao','Mehran Chicken Pulao 50g','en'),
('a_imp_mehran-chicken-tikka_664b7240a8a8','imp_mehran-chicken-tikka','Mehran Chicken Tikka 50g','en'),
('a_imp_mehran-coriander-powder_2cfefc712ded','imp_mehran-coriander-powder','Mehran Coriander Powder 100g','en'),
('a_imp_mehran-cumin-powder_91ddd56ed97e','imp_mehran-cumin-powder','Mehran Cumin Powder 100g','en'),
('a_imp_mehran-garam-masala_156915f8b9e4','imp_mehran-garam-masala','Mehran Garam Masala 100g','en'),
('a_imp_mehran-haleem_b907d0b2e6cc','imp_mehran-haleem','Mehran Haleem 50g','en'),
('a_imp_mehran-karahi-masala_80e0b7544cbe','imp_mehran-karahi-masala','Mehran Karahi Masala 50g','en'),
('a_imp_mehran-lime-pickle_c3642e1aaf1d','imp_mehran-lime-pickle','Mehran Lime Pickle','en'),
('a_imp_mehran-mango-pickle_adf0362fe4b4','imp_mehran-mango-pickle','Mehran Mango Pickle','en'),
('a_imp_mehran-mixed-pickle_ad9cc3c0156f','imp_mehran-mixed-pickle','Mehran Mixed Pickle','en'),
('a_imp_mehran-nihari_2e750ef40ef6','imp_mehran-nihari','Mehran Nihari 50g','en'),
('a_imp_mehran-qorma-masala_19e5c6f8f87a','imp_mehran-qorma-masala','Mehran Qorma Masala 50g','en'),
('a_imp_mehran-red-chilli-powder_235ce9411aa8','imp_mehran-red-chilli-powder','Mehran Red Chilli Powder 100g','en'),
('a_imp_mehran-shami-kabab_2ac71e30af8b','imp_mehran-shami-kabab','Mehran Shami Kabab 50g','en'),
('a_imp_mehran-sindhi-biryani_571662a1283e','imp_mehran-sindhi-biryani','Mehran Sindhi Biryani 50g','en'),
('a_imp_mehran-turmeric-powder_fffc14f11103','imp_mehran-turmeric-powder','Mehran Turmeric Powder 100g','en'),
('a_imp_mentos-mentos-mint_49f26b4d3177','imp_mentos-mentos-mint','Mentos Mint','en'),
('a_imp_mercedes-benz-c-class_73bf22024ea4','imp_mercedes-benz-c-class','Mercedes-Benz C-Class','en'),
('a_imp_mercedes-benz-e-class_98ce28d45e62','imp_mercedes-benz-e-class','Mercedes-Benz E-Class','en'),
('a_imp_mercedes-benz-glc_5822efa0b3b4','imp_mercedes-benz-glc','Mercedes-Benz GLC','en'),
('a_imp_mercedes-benz-s-class_712d487089c2','imp_mercedes-benz-s-class','Mercedes-Benz S-Class','en'),
('a_imp_merck-neurobion_21d84bccf48a','imp_merck-neurobion','Merck Neurobion','en'),
('a_imp_merck-neurobion-forte_fa3b9309e249','imp_merck-neurobion-forte','Merck Neurobion Forte','en'),
('a_imp_merck-sangobion_2db0a754d56f','imp_merck-sangobion','Merck Sangobion','en'),
('a_imp_mezan-banaspati_e7a8520e3482','imp_mezan-banaspati','Mezan Banaspati 5kg','en'),
('a_imp_mezan-cooking-oil_949c7331128d','imp_mezan-cooking-oil','Mezan Cooking Oil 5L','en'),
('a_imp_mg-hs_45ee247c86a7','imp_mg-hs','MG HS','en'),
('a_imp_mg-zs_0f004f7557f2','imp_mg-zs','MG ZS','en'),
('a_imp_mg-zs-ev_997e467fe8f0','imp_mg-zs-ev','MG ZS EV','en'),
('a_imp_michelin-energy-xm2_0e178a75106a','imp_michelin-energy-xm2','Michelin Energy XM2','en'),
('a_imp_michelin-pilot-sport_601081b1de56','imp_michelin-pilot-sport','Michelin Pilot Sport','en'),
('a_imp_michelin-primacy_3e87cf73b9c2','imp_michelin-primacy','Michelin Primacy','en'),
('a_imp_miilee-bhel-puri_2670a30cc8c5','imp_miilee-bhel-puri','Miilee Bhel Puri','en'),
('a_imp_milkpak-cream_8f88e4a897de','imp_milkpak-cream','Milkpak Cream','en'),
('a_imp_milkpak-full-cream-milk_9ac14689dfed','imp_milkpak-full-cream-milk','Milkpak Full Cream Milk 1L','en'),
('a_imp_milo-milo_508051355f70','imp_milo-milo','Milo','en'),
('a_imp_mirinda-mirinda-orange_f9183594dcf8','imp_mirinda-mirinda-orange','Mirinda Orange 500ml','en'),
('a_imp_mitchell-s-apricot-jam_8906cbe7cc13','imp_mitchell-s-apricot-jam','Mitchell''s Apricot Jam','en'),
('a_imp_mitchell-s-baked-beans_798f5064e9f3','imp_mitchell-s-baked-beans','Mitchell''s Baked Beans','en'),
('a_imp_mitchell-s-chilli-garlic-sauce_3084d4bb8699','imp_mitchell-s-chilli-garlic-sauce','Mitchell''s Chilli Garlic Sauce','en'),
('a_imp_mitchell-s-fruit-cocktail_4512e2c311bf','imp_mitchell-s-fruit-cocktail','Mitchell''s Fruit Cocktail','en'),
('a_imp_mitchell-s-lemon-squash_69e79065affa','imp_mitchell-s-lemon-squash','Mitchell''s Lemon Squash','en'),
('a_imp_mitchell-s-mango-squash_d469b3487546','imp_mitchell-s-mango-squash','Mitchell''s Mango Squash','en'),
('a_imp_mitchell-s-mixed-fruit-jam_60c535cf57ad','imp_mitchell-s-mixed-fruit-jam','Mitchell''s Mixed Fruit Jam','en'),
('a_imp_mitchell-s-orange-marmalade_787fcab41000','imp_mitchell-s-orange-marmalade','Mitchell''s Orange Marmalade','en'),
('a_imp_mitchell-s-orange-squash_839dd519c588','imp_mitchell-s-orange-squash','Mitchell''s Orange Squash','en'),
('a_imp_mitchell-s-soya-sauce_cc0d47cf6789','imp_mitchell-s-soya-sauce','Mitchell''s Soya Sauce','en'),
('a_imp_mitchell-s-strawberry-jam_faa42a278834','imp_mitchell-s-strawberry-jam','Mitchell''s Strawberry Jam','en'),
('a_imp_mitchell-s-sweet-corn_602980ed105a','imp_mitchell-s-sweet-corn','Mitchell''s Sweet Corn','en'),
('a_imp_mitchell-s-tomato-ketchup_b7814d724c80','imp_mitchell-s-tomato-ketchup','Mitchell''s Tomato Ketchup 1kg','en'),
('a_imp_mitchell-s-tomato-puree_4542b5ab9da3','imp_mitchell-s-tomato-puree','Mitchell''s Tomato Puree','en'),
('a_imp_mitchell-s-white-vinegar_89ddc209619f','imp_mitchell-s-white-vinegar','Mitchell''s White Vinegar','en'),
('a_imp_mitsubishi-lancer_9f04bce3517d','imp_mitsubishi-lancer','Mitsubishi Lancer','en'),
('a_imp_mitsubishi-pajero_46f1f23fe206','imp_mitsubishi-pajero','Mitsubishi Pajero','en'),
('a_imp_molfix-molfix-baby-diapers_4713a5bbf1a5','imp_molfix-molfix-baby-diapers','Molfix Baby Diapers','en'),
('a_imp_molfix-molfix-baby-pants_ff157ebac60b','imp_molfix-molfix-baby-pants','Molfix Baby Pants','en'),
('a_imp_mon-salwa-chicken-chapli-kabab_43ec411bf1ff','imp_mon-salwa-chicken-chapli-kabab','Mon Salwa Chicken Chapli Kabab','en'),
('a_imp_mon-salwa-chicken-nuggets_91170312bbea','imp_mon-salwa-chicken-nuggets','Mon Salwa Chicken Nuggets','en'),
('a_imp_mon-salwa-chicken-samosa_10b08680cbc7','imp_mon-salwa-chicken-samosa','Mon Salwa Chicken Samosa','en'),
('a_imp_mon-salwa-chicken-shami-kabab_247541279fd6','imp_mon-salwa-chicken-shami-kabab','Mon Salwa Chicken Shami Kabab','en'),
('a_imp_mon-salwa-plain-paratha_a593289a63ec','imp_mon-salwa-plain-paratha','Mon Salwa Plain Paratha','en'),
('a_imp_mon-salwa-spring-rolls_7a02ca14abbb','imp_mon-salwa-spring-rolls','Mon Salwa Spring Rolls','en'),
('a_imp_mondelez-halls_b9bacf012fba','imp_mondelez-halls','Mondelez Halls','en'),
('a_imp_mortein-mortein-all-insect-killer-spray_c4ce4fc08c6a','imp_mortein-mortein-all-insect-killer-spray','Mortein All Insect Killer Spray','en'),
('a_imp_mortein-mortein-mosquito-repellent-mats_e817d9fb759b','imp_mortein-mortein-mosquito-repellent-mats','Mortein Mosquito Repellent Mats','en'),
('a_imp_mortein-mortein-powergard-mosquito-coils_03c4aee1fc67','imp_mortein-mortein-powergard-mosquito-coils','Mortein PowerGard Mosquito Coils','en'),
('a_imp_mountain-dew-mountain-dew_f79652109b20','imp_mountain-dew-mountain-dew','Mountain Dew 500ml','en'),
('a_imp_msd-aerius_8b2bbbd4c424','imp_msd-aerius','MSD Aerius','en'),
('a_imp_msd-arcoxia_2ef43bd71589','imp_msd-arcoxia','MSD Arcoxia','en'),
('a_imp_msd-nasonex_7976f61c6336','imp_msd-nasonex','MSD Nasonex','en'),
('a_imp_mundipharma-betadine_075cec0ee6d1','imp_mundipharma-betadine','Mundipharma Betadine','en'),
('a_imp_murree-sparkletts-bottled-drinking-water_23bab59272aa','imp_murree-sparkletts-bottled-drinking-water','Murree Sparkletts Bottled Drinking Water 330ml','en'),
('a_imp_national-achar-gosht_69705ba9f0c9','imp_national-achar-gosht','National Achar Gosht 50g','en'),
('a_imp_national-beef-chapli-kabab_17c2b8bc4bdc','imp_national-beef-chapli-kabab','National Beef Chapli Kabab 50g','en'),
('a_imp_national-bombay-biryani_fefe0abf54ca','imp_national-bombay-biryani','National Bombay Biryani 50g','en'),
('a_imp_national-butter-chicken_3a090f1ec1e7','imp_national-butter-chicken','National Butter Chicken 50g','en'),
('a_imp_national-chana-chaat_3b1b22cf6165','imp_national-chana-chaat','National Chana Chaat 50g','en'),
('a_imp_national-chicken-biryani_f2d337308de5','imp_national-chicken-biryani','National Chicken Biryani 50g','en'),
('a_imp_national-chicken-chapli-kabab_81cf74046478','imp_national-chicken-chapli-kabab','National Chicken Chapli Kabab 50g','en'),
('a_imp_national-chicken-chowmein_07305d9f35f9','imp_national-chicken-chowmein','National Chicken Chowmein 50g','en'),
('a_imp_national-chicken-handi_55fbf8d6e399','imp_national-chicken-handi','National Chicken Handi 50g','en'),
('a_imp_national-chicken-jalfrezi_00c43f0dad66','imp_national-chicken-jalfrezi','National Chicken Jalfrezi 50g','en'),
('a_imp_national-chicken-karahi_3d42de894b85','imp_national-chicken-karahi','National Chicken Karahi 50g','en'),
('a_imp_national-chicken-korma_1e70c4dcf2dc','imp_national-chicken-korma','National Chicken Korma 50g','en'),
('a_imp_national-chicken-manchurian_856e3152cf8b','imp_national-chicken-manchurian','National Chicken Manchurian 50g','en'),
('a_imp_national-chicken-pulao_b5145d03555a','imp_national-chicken-pulao','National Chicken Pulao 50g','en'),
('a_imp_national-chicken-tikka_a92c7797d9ef','imp_national-chicken-tikka','National Chicken Tikka 50g','en'),
('a_imp_national-chicken-white-karahi_f7d7ba691619','imp_national-chicken-white-karahi','National Chicken White Karahi 50g','en'),
('a_imp_national-chilli-garlic-sauce_87f5cce12a19','imp_national-chilli-garlic-sauce','National Chilli Garlic Sauce','en'),
('a_imp_national-coriander-powder_fc16bcee085e','imp_national-coriander-powder','National Coriander Powder 100g','en'),
('a_imp_national-cumin-powder_5bfef9a24038','imp_national-cumin-powder','National Cumin Powder 100g','en'),
('a_imp_national-dahi-baray_aac79fdbb5b4','imp_national-dahi-baray','National Dahi Baray 50g','en'),
('a_imp_national-dry-iron_b247122c0ca2','imp_national-dry-iron','National Dry Iron','en'),
('a_imp_national-electric-kettle_d4b75d40773c','imp_national-electric-kettle','National Electric Kettle','en'),
('a_imp_national-fruit-chaat_3e619a198e5d','imp_national-fruit-chaat','National Fruit Chaat 50g','en'),
('a_imp_national-garam-masala_eabe0a4ac340','imp_national-garam-masala','National Garam Masala 100g','en'),
('a_imp_national-haleem_ec3118e5ad4a','imp_national-haleem','National Haleem 50g','en'),
('a_imp_national-hyderabadi-pickle_f764f72c3135','imp_national-hyderabadi-pickle','National Hyderabadi Pickle','en'),
('a_imp_national-iodized-salt_ba9563353989','imp_national-iodized-salt','National Iodized Salt','en'),
('a_imp_national-juicer-blender_ec70dda4ed4a','imp_national-juicer-blender','National Juicer Blender','en'),
('a_imp_national-karahi-gosht_f8b2d037ac3d','imp_national-karahi-gosht','National Karahi Gosht 50g','en'),
('a_imp_national-lahori-chargha_7054bc5b1e36','imp_national-lahori-chargha','National Lahori Chargha 50g','en'),
('a_imp_national-lahori-fish_51041cabbebb','imp_national-lahori-fish','National Lahori Fish 50g','en'),
('a_imp_national-lime-pickle_30a6a8662e7e','imp_national-lime-pickle','National Lime Pickle','en'),
('a_imp_national-malai-boti_5447c8c91973','imp_national-malai-boti','National Malai Boti 50g','en'),
('a_imp_national-mango-pickle_7296cae5b2c1','imp_national-mango-pickle','National Mango Pickle','en'),
('a_imp_national-memoni-biryani_a77afcbb97eb','imp_national-memoni-biryani','National Memoni Biryani 50g','en'),
('a_imp_national-mixed-fruit-jam_35c2ffc8e7b4','imp_national-mixed-fruit-jam','National Mixed Fruit Jam','en'),
('a_imp_national-mixed-pickle_627048a01e8c','imp_national-mixed-pickle','National Mixed Pickle','en'),
('a_imp_national-nihari_1c1065318f62','imp_national-nihari','National Nihari 50g','en'),
('a_imp_national-paya_47b72a1a44d5','imp_national-paya','National Paya 50g','en'),
('a_imp_national-qeema_68a2b90772ee','imp_national-qeema','National Qeema 50g','en'),
('a_imp_national-red-chilli-powder_6b50ff813bfd','imp_national-red-chilli-powder','National Red Chilli Powder 100g','en'),
('a_imp_national-sandwich-maker_e8c862774e3b','imp_national-sandwich-maker','National Sandwich Maker','en'),
('a_imp_national-seekh-kabab_58082350c664','imp_national-seekh-kabab','National Seekh Kabab 50g','en'),
('a_imp_national-shami-kabab_80110915dc29','imp_national-shami-kabab','National Shami Kabab 50g','en'),
('a_imp_national-sindhi-biryani_123698211de3','imp_national-sindhi-biryani','National Sindhi Biryani 50g','en'),
('a_imp_national-siri-paya_0b498d3be7ea','imp_national-siri-paya','National Siri Paya 50g','en'),
('a_imp_national-soya-sauce_6ce914516bb7','imp_national-soya-sauce','National Soya Sauce','en'),
('a_imp_national-strawberry-jam_4ba986516d02','imp_national-strawberry-jam','National Strawberry Jam','en'),
('a_imp_national-tandoori-masala_4cc38e8b4c61','imp_national-tandoori-masala','National Tandoori Masala 50g','en'),
('a_imp_national-tomato-ketchup_c81a58a1a68c','imp_national-tomato-ketchup','National Tomato Ketchup','en'),
('a_imp_national-turmeric-powder_74cce70df9d5','imp_national-turmeric-powder','National Turmeric Powder 100g','en'),
('a_imp_national-vegetable-biryani_1b6175b13050','imp_national-vegetable-biryani','National Vegetable Biryani 50g','en'),
('a_imp_national-white-vinegar_ae45d7018a6c','imp_national-white-vinegar','National White Vinegar','en'),
('a_imp_neosporin-neosporin-ointment_f82eb64eff23','imp_neosporin-neosporin-ointment','Neosporin Ointment','en'),
('a_imp_nescafe-3-in-1_425a9e7a37f2','imp_nescafe-3-in-1','Nescafe 3 in 1','en'),
('a_imp_nescafe-classic_66cae7519064','imp_nescafe-classic','Nescafe Classic 200g','en'),
('a_imp_nescafe-gold_cf2cc0f6be93','imp_nescafe-gold','Nescafe Gold 100g','en'),
('a_imp_nestl-cerelac-infant-cereal_4cfc5ab2f036','imp_nestl-cerelac-infant-cereal','Nestlé Cerelac Infant Cereal','en'),
('a_imp_nestl-lactogen-infant-formula_32a5116ba0ae','imp_nestl-lactogen-infant-formula','Nestlé Lactogen Infant Formula','en'),
('a_imp_nestl-milo_6338de871851','imp_nestl-milo','Nestlé Milo','en'),
('a_imp_nestl-nan-infant-formula_92cf99c12a4e','imp_nestl-nan-infant-formula','Nestlé NAN Infant Formula','en'),
('a_imp_nestle-cerelac-wheat_a12e3fbffe34','imp_nestle-cerelac-wheat','Nestle Cerelac Wheat','en'),
('a_imp_nestle-corn-flakes_3573453f4dee','imp_nestle-corn-flakes','Nestle Corn Flakes','en'),
('a_imp_nestle-everyday_d00c70cff050','imp_nestle-everyday','Nestle Everyday','en'),
('a_imp_nestle-fruita-vitals-apple_db75a9715b3a','imp_nestle-fruita-vitals-apple','Nestle Fruita Vitals Apple','en'),
('a_imp_nestle-fruita-vitals-mango_22a99f98fd66','imp_nestle-fruita-vitals-mango','Nestle Fruita Vitals Mango','en'),
('a_imp_nestle-fruita-vitals-orange_ef320cec9b35','imp_nestle-fruita-vitals-orange','Nestle Fruita Vitals Orange','en'),
('a_imp_nestle-kitkat_54cd48cfa45f','imp_nestle-kitkat','Nestle KitKat','en'),
('a_imp_nestle-koko-krunch_fa5a5e23087b','imp_nestle-koko-krunch','Nestle Koko Krunch','en'),
('a_imp_nestle-nesfruta_ce2abdeb3f3a','imp_nestle-nesfruta','Nestle Nesfruta','en'),
('a_imp_nestle-nesvita_3d7a46b66d71','imp_nestle-nesvita','Nestle Nesvita','en'),
('a_imp_nestle-nido_3f304ccaba9d','imp_nestle-nido','Nestle Nido','en'),
('a_imp_nestle-pure-life_d9c6af1f692b','imp_nestle-pure-life','Nestle Pure Life 500ml','en'),
('a_imp_new-holland-480_11657f5fb6f7','imp_new-holland-480','New Holland 480','en'),
('a_imp_new-holland-640_636749fabf17','imp_new-holland-640','New Holland 640','en'),
('a_imp_next-cola-next-cola_b108d1d504fd','imp_next-cola-next-cola','Next Cola 345ml','en'),
('a_imp_ngk-iridium-ix_9762185599cb','imp_ngk-iridium-ix','NGK Iridium IX','en'),
('a_imp_ngk-spark-plug_415dbc88623f','imp_ngk-spark-plug','NGK Spark Plug','en'),
('a_imp_nimcos-chana-chilli_8308a11d4283','imp_nimcos-chana-chilli','Nimcos Chana Chilli','en'),
('a_imp_nimcos-crunchy-mix_7916c068d9da','imp_nimcos-crunchy-mix','Nimcos Crunchy Mix','en'),
('a_imp_nimcos-dal-moth_7db64c178fa8','imp_nimcos-dal-moth','Nimcos Dal Moth','en'),
('a_imp_nimcos-mix-nimco_ad5164e57e2f','imp_nimcos-mix-nimco','Nimcos Mix Nimco','en'),
('a_imp_nimcos-spicy-potato-sticks_8c25e005a827','imp_nimcos-spicy-potato-sticks','Nimcos Spicy Potato Sticks','en'),
('a_imp_nissan-dayz_6c4a237f8ccc','imp_nissan-dayz','Nissan Dayz','en'),
('a_imp_nissan-sunny_be53b0d36b62','imp_nissan-sunny','Nissan Sunny','en'),
('a_imp_nivea-nivea-creme_9b73823594f5','imp_nivea-nivea-creme','Nivea Creme','en'),
('a_imp_nivea-nivea-soft-moisturizing-cream_eb13618bbf57','imp_nivea-nivea-soft-moisturizing-cream','Nivea Soft Moisturizing Cream','en'),
('a_imp_nizoral-nizoral-anti-dandruff-shampoo_b3a758ce1123','imp_nizoral-nizoral-anti-dandruff-shampoo','Nizoral Anti-Dandruff Shampoo','en'),
('a_imp_nokia-105_0ec9a64fae01','imp_nokia-105','Nokia 105','en'),
('a_imp_nokia-110_b2faaee4209f','imp_nokia-110','Nokia 110','en'),
('a_imp_nokia-225-4g_1ac3ce57a425','imp_nokia-225-4g','Nokia 225 4G','en'),
('a_imp_nokia-c32_9319f3aee83d','imp_nokia-c32','Nokia C32','en'),
('a_imp_nokia-g42_37d2ef04d1de','imp_nokia-g42','Nokia G42','en'),
('a_imp_novartis-cac-1000_3829096d3a33','imp_novartis-cac-1000','Novartis CaC-1000','en'),
('a_imp_novartis-cac-1000-plus_c8b127fdc370','imp_novartis-cac-1000-plus','Novartis CaC-1000 Plus','en'),
('a_imp_novartis-cataflam_f2c3087ab7d7','imp_novartis-cataflam','Novartis Cataflam','en'),
('a_imp_novartis-foradil_295c65b5053a','imp_novartis-foradil','Novartis Foradil','en'),
('a_imp_novartis-lioresal_1a685019ccff','imp_novartis-lioresal','Novartis Lioresal','en'),
('a_imp_novartis-migranil_1f345aa1aca5','imp_novartis-migranil','Novartis Migranil','en'),
('a_imp_novartis-nezeril_b6fd93d96a4b','imp_novartis-nezeril','Novartis Nezeril','en')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.item_aliases (id,item_id,alias,language) VALUES
('a_imp_novartis-otrivin_162350006219','imp_novartis-otrivin','Novartis Otrivin','en'),
('a_imp_novartis-sinecod_f455222ef063','imp_novartis-sinecod','Novartis Sinecod','en'),
('a_imp_novartis-sirdalud_4855659b17b5','imp_novartis-sirdalud','Novartis Sirdalud','en'),
('a_imp_novartis-voltaren_b91ca08fdeeb','imp_novartis-voltaren','Novartis Voltaren','en'),
('a_imp_novartis-voltaren-emulgel_50cc429facd8','imp_novartis-voltaren-emulgel','Novartis Voltaren Emulgel','en'),
('a_imp_novartis-zaditen_6c8917f85a96','imp_novartis-zaditen','Novartis Zaditen','en'),
('a_imp_nurpur-butter_64c83da39aa3','imp_nurpur-butter','Nurpur Butter','en'),
('a_imp_nurpur-cheese-slices_577dd157be6f','imp_nurpur-cheese-slices','Nurpur Cheese Slices','en'),
('a_imp_nurpur-desi-ghee_018d4cd20778','imp_nurpur-desi-ghee','Nurpur Desi Ghee','en'),
('a_imp_nurpur-full-cream-milk_b2ff5c166606','imp_nurpur-full-cream-milk','Nurpur Full Cream Milk 1L','en'),
('a_imp_nutella-hazelnut-spread_17c0d031120b','imp_nutella-hazelnut-spread','Nutella Hazelnut Spread','en'),
('a_imp_olper-s-full-cream-milk_81d89ddb95d3','imp_olper-s-full-cream-milk','Olper''s Full Cream Milk 1L','en'),
('a_imp_omron-omron-blood-pressure-monitor_948f94fbf71f','imp_omron-omron-blood-pressure-monitor','Omron Blood Pressure Monitor','en'),
('a_imp_omron-omron-digital-thermometer_5a1540c6e452','imp_omron-omron-digital-thermometer','Omron Digital Thermometer','en'),
('a_imp_omron-omron-nebulizer_6538fcf5ef1f','imp_omron-omron-nebulizer','Omron Nebulizer','en'),
('a_imp_on-call-plus-on-call-plus-glucometer_b684670bb234','imp_on-call-plus-on-call-plus-glucometer','On Call Plus Glucometer','en'),
('a_imp_oppo-a18_f2721acf3904','imp_oppo-a18','Oppo A18','en'),
('a_imp_oppo-a3_f2e721cd4670','imp_oppo-a3','Oppo A3','en'),
('a_imp_oppo-a38_40dbad5d3d35','imp_oppo-a38','Oppo A38','en'),
('a_imp_oppo-a58_0d283be1351c','imp_oppo-a58','Oppo A58','en'),
('a_imp_oppo-a60_106c852725d1','imp_oppo-a60','Oppo A60','en'),
('a_imp_oppo-a78_905a7ef7a8bd','imp_oppo-a78','Oppo A78','en'),
('a_imp_oppo-reno-11_f2859afbc6e9','imp_oppo-reno-11','Oppo Reno 11','en'),
('a_imp_oppo-reno-11f_56ed31a42ae1','imp_oppo-reno-11f','Oppo Reno 11F','en'),
('a_imp_oppo-reno-12_afa05ce833c2','imp_oppo-reno-12','Oppo Reno 12','en'),
('a_imp_oral-b-oral-b-toothbrush_0e80bcf85004','imp_oral-b-oral-b-toothbrush','Oral-B Toothbrush','en'),
('a_imp_oreo-oreo-original_dfc0318aeb1b','imp_oreo-oreo-original','Oreo Original','en'),
('a_imp_orient-inverter-air-conditioner_55b65eaea02d','imp_orient-inverter-air-conditioner','Orient Inverter Air Conditioner','en'),
('a_imp_orient-led-smart-tv_3af952b6d53f','imp_orient-led-smart-tv','Orient LED Smart TV','en'),
('a_imp_orient-refrigerator_4014abdd3e42','imp_orient-refrigerator','Orient Refrigerator','en'),
('a_imp_orient-split-air-conditioner_13aa404437c8','imp_orient-split-air-conditioner','Orient Split Air Conditioner','en'),
('a_imp_osaka-mf-70_dffac0c99435','imp_osaka-mf-70','Osaka MF 70','en'),
('a_imp_p-g-pepto-bismol_6b2404d98bac','imp_p-g-pepto-bismol','P&G Pepto-Bismol','en'),
('a_imp_p-g-vicks-vaporub_db0b297eadf5','imp_p-g-vicks-vaporub','P&G Vicks Vaporub','en'),
('a_imp_pak-fan-bracket-fan_f6e80d2ac020','imp_pak-fan-bracket-fan','Pak Fan Bracket Fan','en'),
('a_imp_pak-fan-ceiling-fan_1611299612e1','imp_pak-fan-ceiling-fan','Pak Fan Ceiling Fan','en'),
('a_imp_pak-fan-exhaust-fan_321ed7d47ac9','imp_pak-fan-exhaust-fan','Pak Fan Exhaust Fan','en'),
('a_imp_pak-fan-inverter-ceiling-fan_f5758bb8aacc','imp_pak-fan-inverter-ceiling-fan','Pak Fan Inverter Ceiling Fan','en'),
('a_imp_pak-fan-pedestal-fan_3f678ffcbb05','imp_pak-fan-pedestal-fan','Pak Fan Pedestal Fan','en'),
('a_imp_pakola-pakola-ice-cream-soda_a658629bacce','imp_pakola-pakola-ice-cream-soda','Pakola Ice Cream Soda','en'),
('a_imp_palmolive-palmolive-naturals-soap_7d2d6981f8fc','imp_palmolive-palmolive-naturals-soap','Palmolive Naturals Soap','en'),
('a_imp_pampers-pampers-active-baby-diapers_42ed4eea5814','imp_pampers-pampers-active-baby-diapers','Pampers Active Baby Diapers','en'),
('a_imp_pampers-pampers-baby-diapers_3bbf9f40ec72','imp_pampers-pampers-baby-diapers','Pampers Baby Diapers','en'),
('a_imp_pampers-pampers-premium-care-diapers_94f14a2ee7f6','imp_pampers-pampers-premium-care-diapers','Pampers Premium Care Diapers','en'),
('a_imp_pantene-pantene-pro-v-hair-fall-control-shampoo_32f0c0f973d0','imp_pantene-pantene-pro-v-hair-fall-control-shampoo','Pantene Pro-V Hair Fall Control Shampoo','en'),
('a_imp_pantene-pantene-pro-v-silky-smooth-care-shampoo_69f4aeca0d33','imp_pantene-pantene-pro-v-silky-smooth-care-shampoo','Pantene Pro-V Silky Smooth Care Shampoo','en'),
('a_imp_pantene-pantene-pro-v-total-damage-care-shampoo_ed20c91e74ca','imp_pantene-pantene-pro-v-total-damage-care-shampoo','Pantene Pro-V Total Damage Care Shampoo','en'),
('a_imp_peek-freans-butter-crunch_61c9ff4b947c','imp_peek-freans-butter-crunch','Peek Freans Butter Crunch','en'),
('a_imp_peek-freans-click_01045fc93b18','imp_peek-freans-click','Peek Freans Click','en'),
('a_imp_peek-freans-cocomo_6346775bf2fc','imp_peek-freans-cocomo','Peek Freans Cocomo','en'),
('a_imp_peek-freans-farm-house-cookies-butter_b954315aed9c','imp_peek-freans-farm-house-cookies-butter','Peek Freans Farm House Cookies Butter','en'),
('a_imp_peek-freans-farm-house-cookies-chocolate-chip_c9b89b2c2a83','imp_peek-freans-farm-house-cookies-chocolate-chip','Peek Freans Farm House Cookies Chocolate Chip','en'),
('a_imp_peek-freans-gluco_e82648176d5f','imp_peek-freans-gluco','Peek Freans Gluco','en'),
('a_imp_peek-freans-marie_0f38cc84628c','imp_peek-freans-marie','Peek Freans Marie','en'),
('a_imp_peek-freans-peanut-pik_b29a8595af2d','imp_peek-freans-peanut-pik','Peek Freans Peanut Pik','en'),
('a_imp_peek-freans-rio-chocolate_83366d9452bd','imp_peek-freans-rio-chocolate','Peek Freans Rio Chocolate','en'),
('a_imp_peek-freans-rio-strawberry_6ce38c662bc0','imp_peek-freans-rio-strawberry','Peek Freans Rio Strawberry','en'),
('a_imp_peek-freans-rio-vanilla_2217b867c5a1','imp_peek-freans-rio-vanilla','Peek Freans Rio Vanilla','en'),
('a_imp_peek-freans-saltish_02aba87c8159','imp_peek-freans-saltish','Peek Freans Saltish','en'),
('a_imp_peek-freans-sooper-chocolate_3f9f2b369f6c','imp_peek-freans-sooper-chocolate','Peek Freans Sooper Chocolate','en'),
('a_imp_peek-freans-sooper-elaichi_19ed8fcf7a9b','imp_peek-freans-sooper-elaichi','Peek Freans Sooper Elaichi','en'),
('a_imp_peek-freans-sooper-original_5eca33d1b551','imp_peek-freans-sooper-original','Peek Freans Sooper Original','en'),
('a_imp_peek-freans-zeera-plus_f767a87afc26','imp_peek-freans-zeera-plus','Peek Freans Zeera Plus','en'),
('a_imp_pel-deep-freezer_be12b674bbfa','imp_pel-deep-freezer','PEL Deep Freezer','en'),
('a_imp_pel-inverteron-air-conditioner_949c7810a37a','imp_pel-inverteron-air-conditioner','PEL InverterOn Air Conditioner','en'),
('a_imp_pel-inverteron-refrigerator_f24cf0d38328','imp_pel-inverteron-refrigerator','PEL InverterOn Refrigerator','en'),
('a_imp_pepsi-pepsi_4be239d73ef6','imp_pepsi-pepsi','Pepsi 500ml','en'),
('a_imp_pepsodent-pepsodent-action-original-toothpaste_18478a1a799e','imp_pepsodent-pepsodent-action-original-toothpaste','Pepsodent Action Original Toothpaste','en'),
('a_imp_pfizer-atarax_c5e46d086066','imp_pfizer-atarax','Pfizer Atarax','en'),
('a_imp_pfizer-celebrex_c87d05e19d3c','imp_pfizer-celebrex','Pfizer Celebrex','en'),
('a_imp_pfizer-debridat_de1e629a4736','imp_pfizer-debridat','Pfizer Debridat','en'),
('a_imp_pfizer-feldene_de8248b7f60e','imp_pfizer-feldene','Pfizer Feldene','en'),
('a_imp_pfizer-lyrica_d26b2079269b','imp_pfizer-lyrica','Pfizer Lyrica','en'),
('a_imp_pfizer-ponstan_0bb6223e6e94','imp_pfizer-ponstan','Pfizer Ponstan','en'),
('a_imp_pharmevo-zeet_9fa8c783f5f9','imp_pharmevo-zeet','PharmEvo Zeet','en'),
('a_imp_philips-airfryer_848145756928','imp_philips-airfryer','Philips Airfryer','en'),
('a_imp_philips-dry-iron_9a279c27a2dd','imp_philips-dry-iron','Philips Dry Iron','en'),
('a_imp_philips-electric-kettle_f3ff9a203a1e','imp_philips-electric-kettle','Philips Electric Kettle','en'),
('a_imp_philips-hand-blender_2b1b8e9128b3','imp_philips-hand-blender','Philips Hand Blender','en'),
('a_imp_philips-juicer_00a5d111ea77','imp_philips-juicer','Philips Juicer','en'),
('a_imp_philips-rice-cooker_3ca9f1c9c211','imp_philips-rice-cooker','Philips Rice Cooker','en'),
('a_imp_philips-sandwich-maker_71f54e32069c','imp_philips-sandwich-maker','Philips Sandwich Maker','en'),
('a_imp_philips-steam-iron_6e86fe5b8b40','imp_philips-steam-iron','Philips Steam Iron','en'),
('a_imp_philips-vacuum-cleaner_0f1479b6f6de','imp_philips-vacuum-cleaner','Philips Vacuum Cleaner','en'),
('a_imp_phillips-milk-of-magnesia_4bc1a57c325c','imp_phillips-milk-of-magnesia','Phillips'' Milk of Magnesia','en'),
('a_imp_pirelli-cinturato_3f8a2d693870','imp_pirelli-cinturato','Pirelli Cinturato','en'),
('a_imp_pirelli-p-zero_978d73b04469','imp_pirelli-p-zero','Pirelli P Zero','en'),
('a_imp_pond-s-pond-s-cold-cream_56fa276c4917','imp_pond-s-pond-s-cold-cream','Pond''s Cold Cream','en'),
('a_imp_pond-s-pond-s-oil-control-face-wash_83195df95f30','imp_pond-s-pond-s-oil-control-face-wash','Pond''s Oil Control Face Wash','en'),
('a_imp_pond-s-pond-s-pure-white-face-wash_e88e3d8ffbe2','imp_pond-s-pond-s-pure-white-face-wash','Pond''s Pure White Face Wash','en'),
('a_imp_pond-s-pond-s-vanishing-cream_fdaf1f60df7f','imp_pond-s-pond-s-vanishing-cream','Pond''s Vanishing Cream','en'),
('a_imp_popnosh-caramel-crunch_58a690ab3eef','imp_popnosh-caramel-crunch','Popnosh Caramel Crunch','en'),
('a_imp_popnosh-cheddar-cheese_ce4da5b2cca0','imp_popnosh-cheddar-cheese','Popnosh Cheddar Cheese','en'),
('a_imp_popnosh-choco-loco_4397c21c8bee','imp_popnosh-choco-loco','Popnosh Choco Loco','en'),
('a_imp_prema-full-cream-milk_bbc9169fa172','imp_prema-full-cream-milk','Prema Full Cream Milk 1L','en'),
('a_imp_prince-pearl_d04e268c8e46','imp_prince-pearl','Prince Pearl','en'),
('a_imp_proton-saga_dcec66fa43f5','imp_proton-saga','Proton Saga','en'),
('a_imp_proton-x70_f9b38ab2dcae','imp_proton-x70','Proton X70','en'),
('a_imp_pso-carient-plus_e59e216c143d','imp_pso-carient-plus','PSO Carient Plus','en'),
('a_imp_pso-carient-synthetic_02ac01e1dd8a','imp_pso-carient-synthetic','PSO Carient Synthetic','en'),
('a_imp_pso-carient-ultra_7477a7fb45ad','imp_pso-carient-ultra','PSO Carient Ultra','en'),
('a_imp_pso-deo-max_2d59fa579b18','imp_pso-deo-max','PSO DEO Max','en'),
('a_imp_pyodine-pyodine-antiseptic-solution_19b818bc5709','imp_pyodine-pyodine-antiseptic-solution','Pyodine Antiseptic Solution','en'),
('a_imp_qarshi-jam-e-shirin_734ad8c09767','imp_qarshi-jam-e-shirin','Qarshi Jam-e-Shirin','en'),
('a_imp_qcy-t13_1a71d3edaa2a','imp_qcy-t13','QCY T13','en'),
('a_imp_qcy-t13-earbuds_e081126bdb5a','imp_qcy-t13-earbuds','QCY T13 Earbuds','en'),
('a_imp_qingqi-auto-rickshaw_fb991d878a11','imp_qingqi-auto-rickshaw','Qingqi Auto Rickshaw','en'),
('a_imp_quaker-oats_1b087be9593f','imp_quaker-oats','Quaker Oats','en'),
('a_imp_rafhan-corn-flour_fdae5d1ea849','imp_rafhan-corn-flour','Rafhan Corn Flour','en'),
('a_imp_rafhan-mango-custard-powder_58ad9f571af7','imp_rafhan-mango-custard-powder','Rafhan Mango Custard Powder','en'),
('a_imp_rafhan-orange-jelly-crystals_6a9b6e4ba3a1','imp_rafhan-orange-jelly-crystals','Rafhan Orange Jelly Crystals','en'),
('a_imp_rafhan-pineapple-jelly-crystals_7a08256effa0','imp_rafhan-pineapple-jelly-crystals','Rafhan Pineapple Jelly Crystals','en'),
('a_imp_rafhan-strawberry-custard-powder_ee8ee82a69dc','imp_rafhan-strawberry-custard-powder','Rafhan Strawberry Custard Powder','en'),
('a_imp_rafhan-strawberry-jelly-crystals_ce0ed60eaffe','imp_rafhan-strawberry-jelly-crystals','Rafhan Strawberry Jelly Crystals','en'),
('a_imp_rafhan-vanilla-custard-powder_b49397d3ff7d','imp_rafhan-vanilla-custard-powder','Rafhan Vanilla Custard Powder','en'),
('a_imp_realme-11_dfbcc74d5731','imp_realme-11','Realme 11','en'),
('a_imp_realme-12_3a670d6478aa','imp_realme-12','Realme 12','en'),
('a_imp_realme-c51_945ec2ab24d0','imp_realme-c51','Realme C51','en'),
('a_imp_realme-c53_5d4c91a2bc48','imp_realme-c53','Realme C53','en'),
('a_imp_realme-c55_0c9d3546b7c8','imp_realme-c55','Realme C55','en'),
('a_imp_realme-c61_3c2847acaa11','imp_realme-c61','Realme C61','en'),
('a_imp_realme-c63_281764364dc0','imp_realme-c63','Realme C63','en'),
('a_imp_realme-c65_df1cb414068d','imp_realme-c65','Realme C65','en'),
('a_imp_realme-c67_602e3215bb6c','imp_realme-c67','Realme C67','en'),
('a_imp_realme-note-50_f69f434b6bcc','imp_realme-note-50','Realme Note 50','en'),
('a_imp_reckitt-dettol-antiseptic-liquid_80081e188814','imp_reckitt-dettol-antiseptic-liquid','Reckitt Dettol Antiseptic Liquid','en'),
('a_imp_reckitt-dettol-soap_26b3b3f6aaa0','imp_reckitt-dettol-soap','Reckitt Dettol Soap','en'),
('a_imp_reckitt-disprin_ec5d808d1f47','imp_reckitt-disprin','Reckitt Disprin','en'),
('a_imp_reckitt-gaviscon_e25ba17f8197','imp_reckitt-gaviscon','Reckitt Gaviscon','en'),
('a_imp_reckitt-strepsils_b1233241b1b7','imp_reckitt-strepsils','Reckitt Strepsils','en'),
('a_imp_red-bull-red-bull_84d30d85b834','imp_red-bull-red-bull','Red Bull 250ml','en'),
('a_imp_rin-rin-detergent-bar_f121f02e46d0','imp_rin-rin-detergent-bar','Rin Detergent Bar','en'),
('a_imp_road-prince-125_c462f36254a9','imp_road-prince-125','Road Prince 125','en'),
('a_imp_road-prince-70_534accabd708','imp_road-prince-70','Road Prince 70','en'),
('a_imp_roche-accu-chek-glucometer_1844ee0beedf','imp_roche-accu-chek-glucometer','Roche Accu-Chek Glucometer','en'),
('a_imp_roche-accu-chek-test-strips_175cf9803f09','imp_roche-accu-chek-test-strips','Roche Accu-Chek Test Strips','en'),
('a_imp_roche-kytril_70b581f5d579','imp_roche-kytril','Roche Kytril','en'),
('a_imp_roche-tamiflu_cf6a72918a4c','imp_roche-tamiflu','Roche Tamiflu','en'),
('a_imp_ronin-car-charger_aeaa8a8e7dc7','imp_ronin-car-charger','Ronin Car Charger','en'),
('a_imp_ronin-fast-charger_9c0494c7ca44','imp_ronin-fast-charger','Ronin Fast Charger','en'),
('a_imp_ronin-power-bank_8475f0d6be8d','imp_ronin-power-bank','Ronin Power Bank','en'),
('a_imp_ronin-tws-earbuds_b30bd994b1eb','imp_ronin-tws-earbuds','Ronin TWS Earbuds','en'),
('a_imp_ronin-usb-cable_41cf514d1b74','imp_ronin-usb-cable','Ronin USB Cable','en'),
('a_imp_ronin-wired-handsfree_2a753af57a09','imp_ronin-wired-handsfree','Ronin Wired Handsfree','en'),
('a_imp_rose-petal-rose-petal-facial-tissues_19efe795efd8','imp_rose-petal-rose-petal-facial-tissues','Rose Petal Facial Tissues','en'),
('a_imp_rose-petal-rose-petal-kitchen-towel_aa5eb7b0c7db','imp_rose-petal-rose-petal-kitchen-towel','Rose Petal Kitchen Towel','en'),
('a_imp_rose-petal-rose-petal-toilet-rolls_ee0862618f59','imp_rose-petal-rose-petal-toilet-rolls','Rose Petal Toilet Rolls','en'),
('a_imp_rossmax-rossmax-blood-pressure-monitor_a5572500eb90','imp_rossmax-rossmax-blood-pressure-monitor','Rossmax Blood Pressure Monitor','en'),
('a_imp_rottapharm-viartril_8b1a4c155d4b','imp_rottapharm-viartril','Rottapharm Viartril','en'),
('a_imp_royal-bracket-fan_99817536505c','imp_royal-bracket-fan','Royal Bracket Fan','en'),
('a_imp_royal-ceiling-fan_3a83c825c736','imp_royal-ceiling-fan','Royal Ceiling Fan','en'),
('a_imp_royal-inverter-ceiling-fan_d14ad8f66597','imp_royal-inverter-ceiling-fan','Royal Inverter Ceiling Fan','en'),
('a_imp_royal-pedestal-fan_a87cd400989f','imp_royal-pedestal-fan','Royal Pedestal Fan','en'),
('a_imp_sabroso-chicken-nuggets_bcd5bbdc0b6b','imp_sabroso-chicken-nuggets','Sabroso Chicken Nuggets','en'),
('a_imp_sabroso-chicken-seekh-kabab_81a4a9330994','imp_sabroso-chicken-seekh-kabab','Sabroso Chicken Seekh Kabab','en'),
('a_imp_sabroso-chicken-strips_c9f720eb2c8e','imp_sabroso-chicken-strips','Sabroso Chicken Strips','en'),
('a_imp_saeed-ghani-saeed-ghani-ubtan-powder_56e1556faad7','imp_saeed-ghani-saeed-ghani-ubtan-powder','Saeed Ghani Ubtan Powder','en'),
('a_imp_safeguard-safeguard-lemon-fresh-soap_1108fa00ca13','imp_safeguard-safeguard-lemon-fresh-soap','Safeguard Lemon Fresh Soap','en'),
('a_imp_safeguard-safeguard-liquid-handwash_17357242d5e0','imp_safeguard-safeguard-liquid-handwash','Safeguard Liquid Handwash 200ml','en'),
('a_imp_safeguard-safeguard-pure-white-soap_9824992bfc32','imp_safeguard-safeguard-pure-white-soap','Safeguard Pure White Soap','en'),
('a_imp_sami-dicloran_d994df029b4d','imp_sami-dicloran','Sami Dicloran','en'),
('a_imp_sami-navidoxine_7962d6721f47','imp_sami-navidoxine','Sami Navidoxine','en'),
('a_imp_sami-skilax_0cf5fe341cd1','imp_sami-skilax','Sami Skilax','en'),
('a_imp_sami-tres-orix_2f67641d9ae0','imp_sami-tres-orix','Sami Tres-Orix','en'),
('a_imp_sami-ulsanic_303d0b331a27','imp_sami-ulsanic','Sami Ulsanic','en'),
('a_imp_samsung-25w-usb-c-charger_26fcf68154a4','imp_samsung-25w-usb-c-charger','Samsung 25W USB-C Charger','en'),
('a_imp_samsung-crystal-4k-uhd-tv_e165d9256881','imp_samsung-crystal-4k-uhd-tv','Samsung Crystal 4K UHD TV','en'),
('a_imp_samsung-galaxy-a05_8eb0b51f3eb3','imp_samsung-galaxy-a05','Samsung Galaxy A05','en'),
('a_imp_samsung-galaxy-a05s_0a8ffe539d6d','imp_samsung-galaxy-a05s','Samsung Galaxy A05s','en'),
('a_imp_samsung-galaxy-a06_9147fa7db5f6','imp_samsung-galaxy-a06','Samsung Galaxy A06','en'),
('a_imp_samsung-galaxy-a15_b291f7d358ec','imp_samsung-galaxy-a15','Samsung Galaxy A15','en'),
('a_imp_samsung-galaxy-a16_1f28d319c580','imp_samsung-galaxy-a16','Samsung Galaxy A16','en'),
('a_imp_samsung-galaxy-a25_e5e81981a63b','imp_samsung-galaxy-a25','Samsung Galaxy A25','en'),
('a_imp_samsung-galaxy-a34_6be02333cf81','imp_samsung-galaxy-a34','Samsung Galaxy A34','en'),
('a_imp_samsung-galaxy-a35_2b24141c08fb','imp_samsung-galaxy-a35','Samsung Galaxy A35','en'),
('a_imp_samsung-galaxy-a36_ba7a8e998099','imp_samsung-galaxy-a36','Samsung Galaxy A36','en'),
('a_imp_samsung-galaxy-a55_d68ce72949b1','imp_samsung-galaxy-a55','Samsung Galaxy A55','en'),
('a_imp_samsung-galaxy-buds-2_f4eddce0a584','imp_samsung-galaxy-buds-2','Samsung Galaxy Buds 2','en'),
('a_imp_samsung-galaxy-s23_1fe033b290ff','imp_samsung-galaxy-s23','Samsung Galaxy S23','en'),
('a_imp_samsung-galaxy-s23-fe_c9d6fdc28da2','imp_samsung-galaxy-s23-fe','Samsung Galaxy S23 FE','en'),
('a_imp_samsung-galaxy-s23-ultra_78131cbff8f2','imp_samsung-galaxy-s23-ultra','Samsung Galaxy S23 Ultra','en'),
('a_imp_samsung-galaxy-s24_562156a97eea','imp_samsung-galaxy-s24','Samsung Galaxy S24','en'),
('a_imp_samsung-galaxy-s24-fe_54e265e39d08','imp_samsung-galaxy-s24-fe','Samsung Galaxy S24 FE','en'),
('a_imp_samsung-galaxy-s25_059067b4e765','imp_samsung-galaxy-s25','Samsung Galaxy S25','en'),
('a_imp_samsung-galaxy-tab-a9_b321ee75cbd6','imp_samsung-galaxy-tab-a9','Samsung Galaxy Tab A9','en'),
('a_imp_samsung-galaxy-tab-a9-2_92e9c0e3efb8','imp_samsung-galaxy-tab-a9-2','Samsung Galaxy Tab A9+','en'),
('a_imp_samsung-galaxy-tab-s6-lite_e237416168aa','imp_samsung-galaxy-tab-s6-lite','Samsung Galaxy Tab S6 Lite','en'),
('a_imp_samsung-galaxy-tab-s9-fe_1c48a73a2781','imp_samsung-galaxy-tab-s9-fe','Samsung Galaxy Tab S9 FE','en'),
('a_imp_samsung-galaxy-watch-6_e5d73d5fcf44','imp_samsung-galaxy-watch-6','Samsung Galaxy Watch 6','en'),
('a_imp_samsung-galaxy-z-flip-5_d337a0681f4d','imp_samsung-galaxy-z-flip-5','Samsung Galaxy Z Flip 5','en'),
('a_imp_samsung-galaxy-z-flip-6_169d34097df0','imp_samsung-galaxy-z-flip-6','Samsung Galaxy Z Flip 6','en'),
('a_imp_samsung-galaxy-z-fold-5_3f20092f45d6','imp_samsung-galaxy-z-fold-5','Samsung Galaxy Z Fold 5','en'),
('a_imp_samsung-galaxy-z-fold-6_be2979cdb2e5','imp_samsung-galaxy-z-fold-6','Samsung Galaxy Z Fold 6','en'),
('a_imp_samsung-monitor_2672a5be2bc4','imp_samsung-monitor','Samsung Monitor','en'),
('a_imp_samsung-qled-4k-tv_6bcf86647e12','imp_samsung-qled-4k-tv','Samsung QLED 4K TV','en'),
('a_imp_samsung-top-load-automatic-washing-machine_0c1ae3d7aaa3','imp_samsung-top-load-automatic-washing-machine','Samsung Top Load Automatic Washing Machine','en'),
('a_imp_sandisk-memory-card_ea498541dc92','imp_sandisk-memory-card','SanDisk Memory Card','en'),
('a_imp_sandisk-usb-flash-drive_80dd4f65d787','imp_sandisk-usb-flash-drive','SanDisk USB Flash Drive','en'),
('a_imp_sanofi-avil_d201618338a8','imp_sanofi-avil','Sanofi Avil','en'),
('a_imp_sanofi-bisolvon_ed76910e6955','imp_sanofi-bisolvon','Sanofi Bisolvon','en'),
('a_imp_sanofi-buscopan_fa72bb3bf030','imp_sanofi-buscopan','Sanofi Buscopan','en'),
('a_imp_sanofi-essentiale_06ccc8f8c1fe','imp_sanofi-essentiale','Sanofi Essentiale','en'),
('a_imp_sanofi-flagyl_3bc41a8c4277','imp_sanofi-flagyl','Sanofi Flagyl','en'),
('a_imp_sanofi-guttalax_0d606a8e5d6d','imp_sanofi-guttalax','Sanofi Guttalax','en'),
('a_imp_sanofi-mucosolvan_600fa7d36ecd','imp_sanofi-mucosolvan','Sanofi Mucosolvan','en'),
('a_imp_sanofi-muscoril_3306d3352fd0','imp_sanofi-muscoril','Sanofi Muscoril','en'),
('a_imp_sanofi-nasacort_813074f8fc67','imp_sanofi-nasacort','Sanofi Nasacort','en'),
('a_imp_sanofi-no-spa_faabcb7753f8','imp_sanofi-no-spa','Sanofi No-Spa','en'),
('a_imp_sanofi-novalgin_a64dde5def01','imp_sanofi-novalgin','Sanofi Novalgin','en'),
('a_imp_sanofi-phenergan_7a2957c754dd','imp_sanofi-phenergan','Sanofi Phenergan','en'),
('a_imp_sanofi-proctosedyl_49734278716e','imp_sanofi-proctosedyl','Sanofi Proctosedyl','en'),
('a_imp_sanofi-telfast_7f7d229424a3','imp_sanofi-telfast','Sanofi Telfast','en'),
('a_imp_sanofi-vaxigrip_ac03e0da5aca','imp_sanofi-vaxigrip','Sanofi Vaxigrip','en'),
('a_imp_sazgar-auto-rickshaw_3013e8b8cf52','imp_sazgar-auto-rickshaw','Sazgar Auto Rickshaw','en'),
('a_imp_scabion-scabion-lotion_52c4c376aa46','imp_scabion-scabion-lotion','Scabion Lotion','en'),
('a_imp_searle-anafortan_c41629f3e61f','imp_searle-anafortan','Searle Anafortan','en'),
('a_imp_searle-gravinate_7a18e085198c','imp_searle-gravinate','Searle Gravinate','en'),
('a_imp_searle-hydryllin_e494f56ba9f2','imp_searle-hydryllin','Searle Hydryllin','en'),
('a_imp_searle-hydryllin-dm_4ac841971daf','imp_searle-hydryllin-dm','Searle Hydryllin DM','en'),
('a_imp_searle-nuberol_ca64d44ddc7b','imp_searle-nuberol','Searle Nuberol','en'),
('a_imp_searle-nuberol-forte_e9f2e2477cbc','imp_searle-nuberol-forte','Searle Nuberol Forte','en'),
('a_imp_seasons-canola-oil_381906a8f816','imp_seasons-canola-oil','Seasons Canola Oil 5L','en'),
('a_imp_sensodyne-sensodyne-rapid-relief-toothpaste_aab00ea70534','imp_sensodyne-sensodyne-rapid-relief-toothpaste','Sensodyne Rapid Relief Toothpaste','en'),
('a_imp_sensodyne-sensodyne-repair-protect-toothpaste_7b547c59e8a2','imp_sensodyne-sensodyne-repair-protect-toothpaste','Sensodyne Repair & Protect Toothpaste','en'),
('a_imp_servis-cheetah_7fd0e53614db','imp_servis-cheetah','Servis Cheetah','en'),
('a_imp_servis-longlife_306cd30aeb81','imp_servis-longlife','Servis Longlife','en'),
('a_imp_seven-seas-seven-seas-cod-liver-oil_3059c639d197','imp_seven-seas-seven-seas-cod-liver-oil','Seven Seas Cod Liver Oil','en'),
('a_imp_shahi-ballay-ballay-dal-chaska_1bd54b3ce137','imp_shahi-ballay-ballay-dal-chaska','Shahi Ballay Ballay Dal Chaska','en'),
('a_imp_shan-achar-gosht_282ac26f78ac','imp_shan-achar-gosht','Shan Achar Gosht 50g','en'),
('a_imp_shan-beef-chapli-kabab_a97f32a40fe9','imp_shan-beef-chapli-kabab','Shan Beef Chapli Kabab 50g','en'),
('a_imp_shan-bihari-kabab_b23cf54ff5f8','imp_shan-bihari-kabab','Shan Bihari Kabab 50g','en'),
('a_imp_shan-bombay-biryani_43155e531f4c','imp_shan-bombay-biryani','Shan Bombay Biryani 50g','en'),
('a_imp_shan-butter-chicken_34ac15d02b3a','imp_shan-butter-chicken','Shan Butter Chicken 50g','en'),
('a_imp_shan-chana-chaat_44ecb940ed64','imp_shan-chana-chaat','Shan Chana Chaat 50g','en'),
('a_imp_shan-chana-masala_1eb1d142aa5d','imp_shan-chana-masala','Shan Chana Masala 50g','en'),
('a_imp_shan-chicken-biryani_50dab02d75a3','imp_shan-chicken-biryani','Shan Chicken Biryani 50g','en'),
('a_imp_shan-chicken-chapli-kabab_86b722bf2ec9','imp_shan-chicken-chapli-kabab','Shan Chicken Chapli Kabab 50g','en'),
('a_imp_shan-chicken-chowmein_be04df02a03f','imp_shan-chicken-chowmein','Shan Chicken Chowmein 50g','en'),
('a_imp_shan-chicken-handi_42542eb4f8e5','imp_shan-chicken-handi','Shan Chicken Handi 50g','en'),
('a_imp_shan-chicken-jalfrezi_98ba941f0707','imp_shan-chicken-jalfrezi','Shan Chicken Jalfrezi 50g','en'),
('a_imp_shan-chicken-karahi_34da0c7de3aa','imp_shan-chicken-karahi','Shan Chicken Karahi 50g','en'),
('a_imp_shan-chicken-korma_bb5819fcc1e6','imp_shan-chicken-korma','Shan Chicken Korma 50g','en'),
('a_imp_shan-chicken-manchurian_418ab46691a7','imp_shan-chicken-manchurian','Shan Chicken Manchurian 50g','en'),
('a_imp_shan-chicken-pulao_8adf401e85cf','imp_shan-chicken-pulao','Shan Chicken Pulao 50g','en'),
('a_imp_shan-chicken-tikka_18f13a07c1b4','imp_shan-chicken-tikka','Shan Chicken Tikka 50g','en'),
('a_imp_shan-chicken-white-karahi_33fdcbc35513','imp_shan-chicken-white-karahi','Shan Chicken White Karahi 50g','en'),
('a_imp_shan-coriander-powder_8d732646cf0a','imp_shan-coriander-powder','Shan Coriander Powder 100g','en'),
('a_imp_shan-cumin-powder_52a12350a9b1','imp_shan-cumin-powder','Shan Cumin Powder 100g','en'),
('a_imp_shan-dahi-baray_37cd17ff5faa','imp_shan-dahi-baray','Shan Dahi Baray 50g','en'),
('a_imp_shan-dal-fry_313622a81ba1','imp_shan-dal-fry','Shan Dal Fry 50g','en'),
('a_imp_shan-dal-gosht_7488c8842a29','imp_shan-dal-gosht','Shan Dal Gosht 50g','en'),
('a_imp_shan-fruit-chaat_f86da590c5bb','imp_shan-fruit-chaat','Shan Fruit Chaat 50g','en'),
('a_imp_shan-garam-masala_f1cd9053570f','imp_shan-garam-masala','Shan Garam Masala 100g','en'),
('a_imp_shan-gola-kabab_604d2b3ecef6','imp_shan-gola-kabab','Shan Gola Kabab 50g','en'),
('a_imp_shan-haleem_0df99a67d26c','imp_shan-haleem','Shan Haleem 50g','en'),
('a_imp_shan-hyderabadi-pickle_b34d8912985e','imp_shan-hyderabadi-pickle','Shan Hyderabadi Pickle','en'),
('a_imp_shan-kabuli-pulao_3751ccb92a10','imp_shan-kabuli-pulao','Shan Kabuli Pulao 50g','en'),
('a_imp_shan-karachi-beef-biryani_287b7d6d6696','imp_shan-karachi-beef-biryani','Shan Karachi Beef Biryani 50g','en'),
('a_imp_shan-lahori-chargha_7dbd07be9c3e','imp_shan-lahori-chargha','Shan Lahori Chargha 50g','en'),
('a_imp_shan-lahori-fish_48ccd907da81','imp_shan-lahori-fish','Shan Lahori Fish 50g','en'),
('a_imp_shan-lime-pickle_4f92567fb38d','imp_shan-lime-pickle','Shan Lime Pickle','en'),
('a_imp_shan-malai-boti_cdbd243e4366','imp_shan-malai-boti','Shan Malai Boti 50g','en'),
('a_imp_shan-mango-pickle_01b0921d32b8','imp_shan-mango-pickle','Shan Mango Pickle','en'),
('a_imp_shan-memoni-biryani_a71c87361c27','imp_shan-memoni-biryani','Shan Memoni Biryani 50g','en'),
('a_imp_shan-mixed-pickle_46f47e4c01c1','imp_shan-mixed-pickle','Shan Mixed Pickle','en'),
('a_imp_shan-mutton-karahi_c3722309b7ef','imp_shan-mutton-karahi','Shan Mutton Karahi 50g','en'),
('a_imp_shan-nihari_e468c46e382b','imp_shan-nihari','Shan Nihari 50g','en'),
('a_imp_shan-pakora-mix_5a26e28bf488','imp_shan-pakora-mix','Shan Pakora Mix 50g','en'),
('a_imp_shan-pani-puri_0b779bbfc312','imp_shan-pani-puri','Shan Pani Puri 50g','en'),
('a_imp_shan-paya_835a156e9d06','imp_shan-paya','Shan Paya 50g','en'),
('a_imp_shan-qeema_df7f2c325320','imp_shan-qeema','Shan Qeema 50g','en'),
('a_imp_shan-red-chilli-powder_112a858da96c','imp_shan-red-chilli-powder','Shan Red Chilli Powder 100g','en'),
('a_imp_shan-samosa_015a006abacf','imp_shan-samosa','Shan Samosa 50g','en'),
('a_imp_shan-seekh-kabab_2b772d2252db','imp_shan-seekh-kabab','Shan Seekh Kabab 50g','en'),
('a_imp_shan-shami-kabab_7e043646a445','imp_shan-shami-kabab','Shan Shami Kabab 50g','en'),
('a_imp_shan-sindhi-biryani_a369ad90d772','imp_shan-sindhi-biryani','Shan Sindhi Biryani 50g','en'),
('a_imp_shan-siri-paya_2fa5aa433f2d','imp_shan-siri-paya','Shan Siri Paya 50g','en'),
('a_imp_shan-tandoori-masala_4ca95d7f9cd1','imp_shan-tandoori-masala','Shan Tandoori Masala 50g','en'),
('a_imp_shan-turmeric-powder_d44dd57e9206','imp_shan-turmeric-powder','Shan Turmeric Powder 100g','en'),
('a_imp_shan-vegetable-biryani_679069946f89','imp_shan-vegetable-biryani','Shan Vegetable Biryani 50g','en'),
('a_imp_shan-yakhni-pulao_8eb47177a6dd','imp_shan-yakhni-pulao','Shan Yakhni Pulao 50g','en'),
('a_imp_shangrila-bbq-sauce_75151e668766','imp_shangrila-bbq-sauce','Shangrila BBQ Sauce','en'),
('a_imp_shangrila-chilli-garlic-sauce_128aec0cd9bf','imp_shangrila-chilli-garlic-sauce','Shangrila Chilli Garlic Sauce','en'),
('a_imp_shangrila-soya-sauce_71e16587dbb0','imp_shangrila-soya-sauce','Shangrila Soya Sauce','en'),
('a_imp_shangrila-tomato-ketchup_38d2300daf3d','imp_shangrila-tomato-ketchup','Shangrila Tomato Ketchup','en'),
('a_imp_shangrila-white-vinegar_c3d170a36bce','imp_shangrila-white-vinegar','Shangrila White Vinegar','en'),
('a_imp_shell-advance-ax5_534ffc538f73','imp_shell-advance-ax5','Shell Advance AX5','en'),
('a_imp_shell-helix-hx3_10386b9c3c8e','imp_shell-helix-hx3','Shell Helix HX3','en'),
('a_imp_shell-helix-hx5_71a07a1ae3cd','imp_shell-helix-hx5','Shell Helix HX5','en'),
('a_imp_shell-helix-hx6_cced2e2c9ab9','imp_shell-helix-hx6','Shell Helix HX6','en'),
('a_imp_shell-helix-hx7_08b4670818bb','imp_shell-helix-hx7','Shell Helix HX7','en'),
('a_imp_shell-helix-ultra_c7d82a47bdfd','imp_shell-helix-ultra','Shell Helix Ultra','en'),
('a_imp_shell-rimula-r4_b2522f39c10e','imp_shell-rimula-r4','Shell Rimula R4','en'),
('a_imp_shezan-lychee-juice_c3ac14087d62','imp_shezan-lychee-juice','Shezan Lychee Juice','en'),
('a_imp_shezan-mango-juice_a8bcf258620d','imp_shezan-mango-juice','Shezan Mango Juice','en'),
('a_imp_singer-sewing-machine_4c5260ee105b','imp_singer-sewing-machine','Singer Sewing Machine','en'),
('a_imp_slice-slice-mango_536dd5069ee0','imp_slice-slice-mango','Slice Mango','en'),
('a_imp_smile-apple-juice_5eedcf746404','imp_smile-apple-juice','Smile Apple Juice','en'),
('a_imp_snack-city-kurleez-mirch-masala_a0b07f9c3ef7','imp_snack-city-kurleez-mirch-masala','Snack City Kurleez Mirch Masala','en'),
('a_imp_snakitos-chickpea-masala_a1ccf6beeac3','imp_snakitos-chickpea-masala','Snakitos Chickpea Masala','en'),
('a_imp_snakitos-patata-masala_70dbb93c345e','imp_snakitos-patata-masala','Snakitos Patata Masala','en'),
('a_imp_snakitos-patata-salty_0ef58dd14fd8','imp_snakitos-patata-salty','Snakitos Patata Salty','en'),
('a_imp_sonax-car-shampoo_e544c5364d49','imp_sonax-car-shampoo','Sonax Car Shampoo','en'),
('a_imp_soya-supreme-banaspati_03193ffbd3c2','imp_soya-supreme-banaspati','Soya Supreme Banaspati 5kg','en'),
('a_imp_soya-supreme-cooking-oil_fa800e265345','imp_soya-supreme-cooking-oil','Soya Supreme Cooking Oil 5L','en'),
('a_imp_sprite-sprite_ffa737e5bc27','imp_sprite-sprite','Sprite 500ml','en'),
('a_imp_stillman-s-stillman-s-skin-bleach-cream_dccb64ed6fcb','imp_stillman-s-stillman-s-skin-bleach-cream','Stillman''s Skin Bleach Cream 28g','en'),
('a_imp_sting-sting_3ccca65d3d98','imp_sting-sting','Sting','en'),
('a_imp_stp-octane-booster_c54e40fb7571','imp_stp-octane-booster','STP Octane Booster','en'),
('a_imp_sudocrem-sudocrem-antiseptic-healing-cream_a2deaddabc14','imp_sudocrem-sudocrem-antiseptic-healing-cream','Sudocrem Antiseptic Healing Cream','en'),
('a_imp_sufi-banaspati_3e9ecf8f8690','imp_sufi-banaspati','Sufi Banaspati 5kg','en'),
('a_imp_sufi-cooking-oil_320841924523','imp_sufi-cooking-oil','Sufi Cooking Oil 5L','en'),
('a_imp_sufi-sufi-soap_1e85a3ab5142','imp_sufi-sufi-soap','Sufi Soap','en'),
('a_imp_sunridge-chakki-atta_4198f86692b7','imp_sunridge-chakki-atta','Sunridge Chakki Atta 20kg','en'),
('a_imp_sunridge-maida_129f94ef6412','imp_sunridge-maida','Sunridge Maida 1kg','en'),
('a_imp_sunridge-suji_c14f3c1facd2','imp_sunridge-suji','Sunridge Suji 1kg','en'),
('a_imp_sunsilk-sunsilk-anti-dandruff-shampoo_d43794ac645f','imp_sunsilk-sunsilk-anti-dandruff-shampoo','Sunsilk Anti-Dandruff Shampoo','en'),
('a_imp_sunsilk-sunsilk-black-shine-shampoo_fcbf9ac46da6','imp_sunsilk-sunsilk-black-shine-shampoo','Sunsilk Black Shine Shampoo','en'),
('a_imp_sunsilk-sunsilk-long-healthy-growth-shampoo_8666fb23eacc','imp_sunsilk-sunsilk-long-healthy-growth-shampoo','Sunsilk Long & Healthy Growth Shampoo','en'),
('a_imp_sunsilk-sunsilk-perfect-straight-shampoo_fa6c03a5982d','imp_sunsilk-sunsilk-perfect-straight-shampoo','Sunsilk Perfect Straight Shampoo','en'),
('a_imp_sunsilk-sunsilk-thick-long-shampoo_31852014aa2e','imp_sunsilk-sunsilk-thick-long-shampoo','Sunsilk Thick & Long Shampoo','en'),
('a_imp_super-asia-ceiling-fan_8f0c2d6aa6b9','imp_super-asia-ceiling-fan','Super Asia Ceiling Fan','en'),
('a_imp_super-asia-cooking-range_c703c8c31032','imp_super-asia-cooking-range','Super Asia Cooking Range','en'),
('a_imp_super-asia-pedestal-fan_555eb3dcd142','imp_super-asia-pedestal-fan','Super Asia Pedestal Fan','en'),
('a_imp_super-asia-room-cooler_b68d36db79c2','imp_super-asia-room-cooler','Super Asia Room Cooler','en'),
('a_imp_super-asia-twin-tub-washing-machine_77ad24b9c9f3','imp_super-asia-twin-tub-washing-machine','Super Asia Twin Tub Washing Machine','en'),
('a_imp_super-asia-water-dispenser_cc06254d45a6','imp_super-asia-water-dispenser','Super Asia Water Dispenser','en'),
('a_imp_super-crisp-catty-chins-cheese_3e107a5044a0','imp_super-crisp-catty-chins-cheese','Super Crisp Catty Chins Cheese 27g x 6','en'),
('a_imp_super-crisp-dino-munchies-ketchup_0cc331007eee','imp_super-crisp-dino-munchies-ketchup','Super Crisp Dino Munchies Ketchup','en'),
('a_imp_super-crisp-natural-potato-chips-bar-b-q_1bec1783ba8e','imp_super-crisp-natural-potato-chips-bar-b-q','Super Crisp Natural Potato Chips Bar.B.Q 120g','en'),
('a_imp_super-crisp-natural-potato-chips-masala_18fbf7b541f0','imp_super-crisp-natural-potato-chips-masala','Super Crisp Natural Potato Chips Masala','en'),
('a_imp_super-crisp-natural-potato-chips-salted_9867c9f90afe','imp_super-crisp-natural-potato-chips-salted','Super Crisp Natural Potato Chips Salted','en'),
('a_imp_super-crisp-nimko-mix-nuts_10aaeb5cb7a4','imp_super-crisp-nimko-mix-nuts','Super Crisp Nimko Mix & Nuts','en'),
('a_imp_super-crisp-twister-ketchup_9f0d4d4d0a3d','imp_super-crisp-twister-ketchup','Super Crisp Twister Ketchup','en'),
('a_imp_super-power-125_bb0f897de01c','imp_super-power-125','Super Power 125','en'),
('a_imp_super-power-70_da3861995142','imp_super-power-70','Super Power 70','en'),
('a_imp_supreme-supreme-tea_7202c91724bc','imp_supreme-supreme-tea','Supreme Tea','en'),
('a_imp_surf-excel-surf-excel-easy-wash-detergent-powder_a57d9e435526','imp_surf-excel-surf-excel-easy-wash-detergent-powder','Surf Excel Easy Wash Detergent Powder 1kg','en'),
('a_imp_surf-excel-surf-excel-matic-front-load-detergent_1b3d5b45aabc','imp_surf-excel-surf-excel-matic-front-load-detergent','Surf Excel Matic Front Load Detergent 1kg','en'),
('a_imp_surf-excel-surf-excel-matic-top-load-detergent_1f446a77ff71','imp_surf-excel-surf-excel-matic-top-load-detergent','Surf Excel Matic Top Load Detergent 1kg','en'),
('a_imp_suzuki-alto-vx_e9b2481e1af9','imp_suzuki-alto-vx','Suzuki Alto VX','en'),
('a_imp_suzuki-alto-vxl_d9c579f20f61','imp_suzuki-alto-vxl','Suzuki Alto VXL','en'),
('a_imp_suzuki-alto-vxl-ags_5169a801a2be','imp_suzuki-alto-vxl-ags','Suzuki Alto VXL AGS','en'),
('a_imp_suzuki-alto-vxr_fd40745ce4de','imp_suzuki-alto-vxr','Suzuki Alto VXR','en'),
('a_imp_suzuki-apv_b9b960932b2a','imp_suzuki-apv','Suzuki APV','en'),
('a_imp_suzuki-baleno_790e8f5d7250','imp_suzuki-baleno','Suzuki Baleno','en'),
('a_imp_suzuki-bolan_a80347132e87','imp_suzuki-bolan','Suzuki Bolan','en'),
('a_imp_suzuki-cultus-vxl_989d255a62ad','imp_suzuki-cultus-vxl','Suzuki Cultus VXL','en'),
('a_imp_suzuki-cultus-vxl-ags_36899f92da9f','imp_suzuki-cultus-vxl-ags','Suzuki Cultus VXL AGS','en'),
('a_imp_suzuki-cultus-vxr_cba546ca8195','imp_suzuki-cultus-vxr','Suzuki Cultus VXR','en'),
('a_imp_suzuki-every-vx_8d21b2dd5fb5','imp_suzuki-every-vx','Suzuki Every VX','en'),
('a_imp_suzuki-every-vxr_cea924590d55','imp_suzuki-every-vxr','Suzuki Every VXR','en'),
('a_imp_suzuki-fx_569c6eb15da2','imp_suzuki-fx','Suzuki FX','en'),
('a_imp_suzuki-gd-110s_805a19b16dfc','imp_suzuki-gd-110s','Suzuki GD 110S','en'),
('a_imp_suzuki-gr-150_a78f2234c768','imp_suzuki-gr-150','Suzuki GR 150','en'),
('a_imp_suzuki-gs-150_777feaa3d291','imp_suzuki-gs-150','Suzuki GS 150','en'),
('a_imp_suzuki-gs-150-se_e4b4fe66351a','imp_suzuki-gs-150-se','Suzuki GS 150 SE','en'),
('a_imp_suzuki-jimny_953610ce4e1a','imp_suzuki-jimny','Suzuki Jimny','en'),
('a_imp_suzuki-khyber_5e5b3093cd6c','imp_suzuki-khyber','Suzuki Khyber','en'),
('a_imp_suzuki-liana_7910699df66e','imp_suzuki-liana','Suzuki Liana','en'),
('a_imp_suzuki-margalla_86282bbf783a','imp_suzuki-margalla','Suzuki Margalla','en'),
('a_imp_suzuki-mehran-vx_a7604472b1bc','imp_suzuki-mehran-vx','Suzuki Mehran VX','en'),
('a_imp_suzuki-mehran-vxr_5a51f1fd5e3d','imp_suzuki-mehran-vxr','Suzuki Mehran VXR','en'),
('a_imp_suzuki-potohar_2f0d06e2571f','imp_suzuki-potohar','Suzuki Potohar','en'),
('a_imp_suzuki-ravi_05e004ebed55','imp_suzuki-ravi','Suzuki Ravi','en'),
('a_imp_suzuki-swift-dlx_ed77623d2f5a','imp_suzuki-swift-dlx','Suzuki Swift DLX','en'),
('a_imp_suzuki-swift-dx_141f3f1d408a','imp_suzuki-swift-dx','Suzuki Swift DX','en'),
('a_imp_suzuki-swift-gl_303916039907','imp_suzuki-swift-gl','Suzuki Swift GL','en'),
('a_imp_suzuki-swift-gl-cvt_0356ff3d56ae','imp_suzuki-swift-gl-cvt','Suzuki Swift GL CVT','en'),
('a_imp_suzuki-swift-glx_d2895ec4a082','imp_suzuki-swift-glx','Suzuki Swift GLX','en'),
('a_imp_suzuki-wagon-r-vxl_d3f96d6b1521','imp_suzuki-wagon-r-vxl','Suzuki Wagon R VXL','en'),
('a_imp_suzuki-wagon-r-vxl-ags_287b8de4830a','imp_suzuki-wagon-r-vxl-ags','Suzuki Wagon R VXL AGS','en'),
('a_imp_suzuki-wagon-r-vxr_334afcfa3aa1','imp_suzuki-wagon-r-vxr','Suzuki Wagon R VXR','en'),
('a_imp_takeda-pantoloc_3c55a5ba3db9','imp_takeda-pantoloc','Takeda Pantoloc','en'),
('a_imp_tang-tang-mango_24cd7bcf5fc6','imp_tang-tang-mango','Tang Mango','en'),
('a_imp_tang-tang-orange_3fddeb54ee4a','imp_tang-tang-orange','Tang Orange','en'),
('a_imp_tapal-chenak_f929d1faf717','imp_tapal-chenak','Tapal Chenak','en'),
('a_imp_tapal-danedar_775211d18e7b','imp_tapal-danedar','Tapal Danedar 950g','en'),
('a_imp_tapal-family-mixture_57e87a11a64d','imp_tapal-family-mixture','Tapal Family Mixture 950g','en'),
('a_imp_tapal-gulbahar_ce35366a3266','imp_tapal-gulbahar','Tapal Gulbahar','en'),
('a_imp_tapal-mezban_840c698967ab','imp_tapal-mezban','Tapal Mezban 950g','en'),
('a_imp_tapal-tez-dam_fde538516265','imp_tapal-tez-dam','Tapal Tez Dam','en'),
('a_imp_tapal-tezdum_075b68112d2b','imp_tapal-tezdum','Tapal Tezdum 950g','en'),
('a_imp_tarang-tea-whitener_bf5dbf345c05','imp_tarang-tea-whitener','Tarang Tea Whitener','en'),
('a_imp_tcl-android-smart-tv_b0eaf7883e93','imp_tcl-android-smart-tv','TCL Android Smart TV','en'),
('a_imp_tcl-google-tv_05e1312df522','imp_tcl-google-tv','TCL Google TV','en'),
('a_imp_tcl-inverter-air-conditioner_51f0f5018466','imp_tcl-inverter-air-conditioner','TCL Inverter Air Conditioner','en'),
('a_imp_tcl-qled-4k-tv_afd7a06d80ba','imp_tcl-qled-4k-tv','TCL QLED 4K TV','en'),
('a_imp_tecno-camon-20_f3e0c0c411bd','imp_tecno-camon-20','Tecno Camon 20','en'),
('a_imp_tecno-camon-20-pro_eae1070e542f','imp_tecno-camon-20-pro','Tecno Camon 20 Pro','en'),
('a_imp_tecno-camon-30_57277331834f','imp_tecno-camon-30','Tecno Camon 30','en'),
('a_imp_tecno-phantom-v-flip_b4b3f2448219','imp_tecno-phantom-v-flip','Tecno Phantom V Flip','en'),
('a_imp_tecno-pop-7_8bef336d370f','imp_tecno-pop-7','Tecno Pop 7','en'),
('a_imp_tecno-pop-8_5a528a69b8d4','imp_tecno-pop-8','Tecno Pop 8','en'),
('a_imp_tecno-spark-10c_6202c6a3bfea','imp_tecno-spark-10c','Tecno Spark 10C','en'),
('a_imp_tecno-spark-20_5802dd6deca3','imp_tecno-spark-20','Tecno Spark 20','en'),
('a_imp_tecno-spark-20c_6d982204401e','imp_tecno-spark-20c','Tecno Spark 20C','en'),
('a_imp_tecno-spark-go-2024_086effb35ea8','imp_tecno-spark-go-2024','Tecno Spark Go 2024','en'),
('a_imp_tibet-tibet-cold-cream_e7b4b31f24b7','imp_tibet-tibet-cold-cream','Tibet Cold Cream','en'),
('a_imp_tibet-tibet-cream_19821f8cec05','imp_tibet-tibet-cream','Tibet Cream','en'),
('a_imp_tibet-tibet-soap_ea5e76648091','imp_tibet-tibet-soap','Tibet Soap','en'),
('a_imp_tibet-tibet-talcum-powder_a8b342752578','imp_tibet-tibet-talcum-powder','Tibet Talcum Powder','en'),
('a_imp_toblerone-toblerone_cda6184a7047','imp_toblerone-toblerone','Toblerone','en'),
('a_imp_top-pops-chicken_38f0021d2fac','imp_top-pops-chicken','Top Pops Chicken','en'),
('a_imp_top-pops-spicy_ef65ac8f126e','imp_top-pops-spicy','Top Pops Spicy','en'),
('a_imp_total-quartz-5000_d3a72119dcf9','imp_total-quartz-5000','Total Quartz 5000','en'),
('a_imp_total-quartz-7000_767a8ed59989','imp_total-quartz-7000','Total Quartz 7000','en'),
('a_imp_total-quartz-9000_1dd81dc4d426','imp_total-quartz-9000','Total Quartz 9000','en'),
('a_imp_total-rubia_3bd34d8084e1','imp_total-rubia','Total Rubia','en'),
('a_imp_toyota-aqua_3f302642c87d','imp_toyota-aqua','Toyota Aqua','en'),
('a_imp_toyota-camry_51f16cbd2a8e','imp_toyota-camry','Toyota Camry','en'),
('a_imp_toyota-corolla-2-0d_46def1727579','imp_toyota-corolla-2-0d','Toyota Corolla 2.0D','en'),
('a_imp_toyota-corolla-altis_1dbdfe39c47c','imp_toyota-corolla-altis','Toyota Corolla Altis','en'),
('a_imp_toyota-corolla-altis-grande_7a10527c8557','imp_toyota-corolla-altis-grande','Toyota Corolla Altis Grande','en'),
('a_imp_toyota-corolla-altis-x_550fcae18179','imp_toyota-corolla-altis-x','Toyota Corolla Altis X','en'),
('a_imp_toyota-corolla-cross_249dac77e431','imp_toyota-corolla-cross','Toyota Corolla Cross','en'),
('a_imp_toyota-corolla-gli_d6a3d2732dee','imp_toyota-corolla-gli','Toyota Corolla GLi','en'),
('a_imp_toyota-corolla-xli_2440db4fdf5f','imp_toyota-corolla-xli','Toyota Corolla XLi','en'),
('a_imp_toyota-fortuner-2-7-g_0d250fe1d0a7','imp_toyota-fortuner-2-7-g','Toyota Fortuner 2.7 G','en'),
('a_imp_toyota-fortuner-2-8-sigma-4_81a5a1b42dc6','imp_toyota-fortuner-2-8-sigma-4','Toyota Fortuner 2.8 Sigma 4','en'),
('a_imp_toyota-hilux-double-cab-e_15459997559a','imp_toyota-hilux-double-cab-e','Toyota Hilux Double Cab E','en'),
('a_imp_toyota-hilux-double-cab-g_92923cbc1019','imp_toyota-hilux-double-cab-g','Toyota Hilux Double Cab G','en'),
('a_imp_toyota-hilux-revo_16b601e1cff4','imp_toyota-hilux-revo','Toyota Hilux Revo','en'),
('a_imp_toyota-hilux-revo-gr-s_a5d1b355508f','imp_toyota-hilux-revo-gr-s','Toyota Hilux Revo GR-S','en'),
('a_imp_toyota-hilux-single-cab_6714e38163ab','imp_toyota-hilux-single-cab','Toyota Hilux Single Cab','en'),
('a_imp_toyota-hilux-surf_9e3a2d0a5ebd','imp_toyota-hilux-surf','Toyota Hilux Surf','en'),
('a_imp_toyota-hilux-vigo_e65a26c1f4f6','imp_toyota-hilux-vigo','Toyota Hilux Vigo','en'),
('a_imp_toyota-land-cruiser_44997ac82b9a','imp_toyota-land-cruiser','Toyota Land Cruiser','en'),
('a_imp_toyota-land-cruiser-prado_32103f5a569e','imp_toyota-land-cruiser-prado','Toyota Land Cruiser Prado','en'),
('a_imp_toyota-passo_2524f3f0aa2b','imp_toyota-passo','Toyota Passo','en'),
('a_imp_toyota-prius_49dffeba0919','imp_toyota-prius','Toyota Prius','en'),
('a_imp_toyota-vitz_8dbe8a0a8fde','imp_toyota-vitz','Toyota Vitz','en'),
('a_imp_toyota-yaris-ativ_ddec9123e668','imp_toyota-yaris-ativ','Toyota Yaris Ativ','en'),
('a_imp_toyota-yaris-ativ-cvt_829e9b325038','imp_toyota-yaris-ativ-cvt','Toyota Yaris Ativ CVT','en'),
('a_imp_toyota-yaris-ativ-x_274f35fba4bd','imp_toyota-yaris-ativ-x','Toyota Yaris Ativ X','en'),
('a_imp_toyota-yaris-gli_ef68f26ae044','imp_toyota-yaris-gli','Toyota Yaris GLi','en'),
('a_imp_toyota-yaris-gli-cvt_172375a1ddcb','imp_toyota-yaris-gli-cvt','Toyota Yaris GLi CVT','en'),
('a_imp_tresemm-tresemm-biotin-repair-shampoo_fa501e7bafec','imp_tresemm-tresemm-biotin-repair-shampoo','TRESemmé Biotin Repair Shampoo 170ml','en'),
('a_imp_tresemm-tresemm-bondplex-sleek-and-repair-shampo_ffa774d7680f','imp_tresemm-tresemm-bondplex-sleek-and-repair-shampo','TRESemmé Bondplex Sleek And Repair Shampoo 170ml','en'),
('a_imp_tresemm-tresemm-botanique-nourish-and-replenish-_c85aebfef340','imp_tresemm-tresemm-botanique-nourish-and-replenish-','TRESemmé Botanique Nourish And Replenish Shampoo 170ml','en'),
('a_imp_tresemm-tresemm-colour-revitalise-conditioner_47070eb7b9af','imp_tresemm-tresemm-colour-revitalise-conditioner','TRESemmé Colour Revitalise Conditioner 160ml','en'),
('a_imp_tresemm-tresemm-colour-revitalise-shampoo_639686759f77','imp_tresemm-tresemm-colour-revitalise-shampoo','TRESemmé Colour Revitalise Shampoo 170ml','en'),
('a_imp_tresemm-tresemm-keratin-smooth-hair-mask_9aaccb945987','imp_tresemm-tresemm-keratin-smooth-hair-mask','TRESemmé Keratin Smooth Hair Mask 250ml','en'),
('a_imp_tresemm-tresemm-keratin-smooth-serum_e9a188584461','imp_tresemm-tresemm-keratin-smooth-serum','TRESemmé Keratin Smooth Serum 100ml','en'),
('a_imp_tresemm-tresemm-keratin-smooth-straight-conditio_08429c9c19ec','imp_tresemm-tresemm-keratin-smooth-straight-conditio','TRESemmé Keratin Smooth & Straight Conditioner 160ml','en'),
('a_imp_tresemm-tresemm-keratin-smooth-straight-shampoo_341f5e1acb71','imp_tresemm-tresemm-keratin-smooth-straight-shampoo','TRESemmé Keratin Smooth & Straight Shampoo 170ml','en'),
('a_imp_tresemm-tresemm-rich-moisture-shampoo_5147875ac16d','imp_tresemm-tresemm-rich-moisture-shampoo','TRESemmé Rich Moisture Shampoo 170ml','en'),
('a_imp_tropicana-tropicana-orange_42fa3074f297','imp_tropicana-tropicana-orange','Tropicana Orange','en'),
('a_imp_tullo-banaspati_0f54f29026d1','imp_tullo-banaspati','Tullo Banaspati 5kg','en'),
('a_imp_tullo-cooking-oil_5b85f19b4c61','imp_tullo-cooking-oil','Tullo Cooking Oil 5L','en'),
('a_imp_united-alpha_1f3bda750fe5','imp_united-alpha','United Alpha','en'),
('a_imp_united-bravo_6576b0424917','imp_united-bravo','United Bravo','en'),
('a_imp_united-us-125_680548b50eea','imp_united-us-125','United US 125','en'),
('a_imp_united-us-70_97357fdc3e8a','imp_united-us-70','United US 70','en'),
('a_imp_vaseline-vaseline-intensive-care-deep-restore-lo_a460025d7042','imp_vaseline-vaseline-intensive-care-deep-restore-lo','Vaseline Intensive Care Deep Restore Lotion','en'),
('a_imp_vaseline-vaseline-original-petroleum-jelly_7db0c0cfe9b5','imp_vaseline-vaseline-original-petroleum-jelly','Vaseline Original Petroleum Jelly','en'),
('a_imp_veet-veet-hair-removal-cream-normal-skin_ed844c8d0ebb','imp_veet-veet-hair-removal-cream-normal-skin','Veet Hair Removal Cream Normal Skin','en'),
('a_imp_veet-veet-hair-removal-cream-sensitive-skin_3b113c774c52','imp_veet-veet-hair-removal-cream-sensitive-skin','Veet Hair Removal Cream Sensitive Skin','en'),
('a_imp_vim-vim-dishwash-bar_c9807f0079ae','imp_vim-vim-dishwash-bar','Vim Dishwash Bar','en'),
('a_imp_vim-vim-dishwash-liquid-lemon_28adfb54d255','imp_vim-vim-dishwash-liquid-lemon','Vim Dishwash Liquid Lemon','en'),
('a_imp_vital-vital-tea_f08989a7e905','imp_vital-vital-tea','Vital Tea 950g','en'),
('a_imp_vivo-v29_20dfae564aea','imp_vivo-v29','Vivo V29','en'),
('a_imp_vivo-v29e_c16e8ba4ba87','imp_vivo-v29e','Vivo V29e','en'),
('a_imp_vivo-v30_107ea6e9a5cd','imp_vivo-v30','Vivo V30','en'),
('a_imp_vivo-v30e_c5c200980d8d','imp_vivo-v30e','Vivo V30e','en'),
('a_imp_vivo-v40_c6f2ec5ac17f','imp_vivo-v40','Vivo V40','en'),
('a_imp_vivo-y100_0f14bf1c4717','imp_vivo-y100','Vivo Y100','en'),
('a_imp_vivo-y17s_24d18da4adb3','imp_vivo-y17s','Vivo Y17s','en'),
('a_imp_vivo-y28_0795043ff8a6','imp_vivo-y28','Vivo Y28','en'),
('a_imp_vivo-y36_6dd1cd09cd41','imp_vivo-y36','Vivo Y36','en'),
('a_imp_waves-deep-freezer_abffb37ae601','imp_waves-deep-freezer','Waves Deep Freezer','en'),
('a_imp_waves-refrigerator_792c951e29f7','imp_waves-refrigerator','Waves Refrigerator','en'),
('a_imp_waves-twin-tub-washing-machine_29295f41f9b7','imp_waves-twin-tub-washing-machine','Waves Twin Tub Washing Machine','en'),
('a_imp_wd-40-multi-use-product_9c41e097fd76','imp_wd-40-multi-use-product','WD-40 Multi-Use Product','en'),
('a_imp_weetabix-weetabix-original_0db165dd8a82','imp_weetabix-weetabix-original','Weetabix Original','en'),
('a_imp_westpoint-dry-iron_846bd7bdfb4d','imp_westpoint-dry-iron','Westpoint Dry Iron','en'),
('a_imp_westpoint-electric-kettle_7e01730a5b00','imp_westpoint-electric-kettle','Westpoint Electric Kettle','en'),
('a_imp_westpoint-food-chopper_6fcedae48e4b','imp_westpoint-food-chopper','Westpoint Food Chopper','en'),
('a_imp_westpoint-juicer-blender_0e2a57f2b339','imp_westpoint-juicer-blender','Westpoint Juicer Blender','en'),
('a_imp_westpoint-microwave-oven_a3ad564d9300','imp_westpoint-microwave-oven','Westpoint Microwave Oven','en'),
('a_imp_westpoint-room-heater_8398864658c3','imp_westpoint-room-heater','Westpoint Room Heater','en'),
('a_imp_westpoint-sandwich-maker_a3dffee1cb43','imp_westpoint-sandwich-maker','Westpoint Sandwich Maker','en'),
('a_imp_westpoint-toaster_3cc100b992c6','imp_westpoint-toaster','Westpoint Toaster','en'),
('a_imp_woodward-s-woodward-s-gripe-water_6c401d39acc7','imp_woodward-s-woodward-s-gripe-water','Woodward''s Gripe Water','en'),
('a_imp_wrigley-doublemint_a2f6d8caa23d','imp_wrigley-doublemint','Wrigley Doublemint','en'),
('a_imp_xiaomi-mi-portable-bluetooth-speaker_a25358921788','imp_xiaomi-mi-portable-bluetooth-speaker','Xiaomi Mi Portable Bluetooth Speaker','en'),
('a_imp_xiaomi-mi-power-bank_410f6336e262','imp_xiaomi-mi-power-bank','Xiaomi Mi Power Bank','en'),
('a_imp_xiaomi-pad-6_c3cade51f900','imp_xiaomi-pad-6','Xiaomi Pad 6','en'),
('a_imp_xiaomi-poco-m6-pro_ed0c7c30c975','imp_xiaomi-poco-m6-pro','Xiaomi Poco M6 Pro','en'),
('a_imp_xiaomi-poco-x6_645433afae99','imp_xiaomi-poco-x6','Xiaomi Poco X6','en'),
('a_imp_xiaomi-poco-x6-pro_0720d9a7f216','imp_xiaomi-poco-x6-pro','Xiaomi Poco X6 Pro','en'),
('a_imp_xiaomi-redmi-12_b698040d3a70','imp_xiaomi-redmi-12','Xiaomi Redmi 12','en'),
('a_imp_xiaomi-redmi-12c_1216fa446ad4','imp_xiaomi-redmi-12c','Xiaomi Redmi 12C','en'),
('a_imp_xiaomi-redmi-13_517aa81e1817','imp_xiaomi-redmi-13','Xiaomi Redmi 13','en'),
('a_imp_xiaomi-redmi-13c_977c7b357bdf','imp_xiaomi-redmi-13c','Xiaomi Redmi 13C','en'),
('a_imp_xiaomi-redmi-a3_f6faea281851','imp_xiaomi-redmi-a3','Xiaomi Redmi A3','en'),
('a_imp_xiaomi-redmi-buds-4_d26cce350577','imp_xiaomi-redmi-buds-4','Xiaomi Redmi Buds 4','en'),
('a_imp_xiaomi-redmi-buds-4-lite_e0f7e430d9e0','imp_xiaomi-redmi-buds-4-lite','Xiaomi Redmi Buds 4 Lite','en'),
('a_imp_xiaomi-redmi-note-12_6da6749ce5b3','imp_xiaomi-redmi-note-12','Xiaomi Redmi Note 12','en'),
('a_imp_xiaomi-redmi-note-13_7559ff493031','imp_xiaomi-redmi-note-13','Xiaomi Redmi Note 13','en')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.item_aliases (id,item_id,alias,language) VALUES
('a_imp_xiaomi-redmi-note-13-pro_b126dda4c079','imp_xiaomi-redmi-note-13-pro','Xiaomi Redmi Note 13 Pro','en'),
('a_imp_xiaomi-redmi-note-13-pro-2_647eaca92c9a','imp_xiaomi-redmi-note-13-pro-2','Xiaomi Redmi Note 13 Pro+','en'),
('a_imp_xiaomi-redmi-pad-se_dff1837795d6','imp_xiaomi-redmi-pad-se','Xiaomi Redmi Pad SE','en'),
('a_imp_xiaomi-smart-band_1eacc6b9f834','imp_xiaomi-smart-band','Xiaomi Smart Band','en'),
('a_imp_xiaomi-xiaomi-14_a710c796e417','imp_xiaomi-xiaomi-14','Xiaomi 14','en'),
('a_imp_yamaha-yb-125z_af9519c18d68','imp_yamaha-yb-125z','Yamaha YB 125Z','en'),
('a_imp_yamaha-yb-125z-dx_5a438d977d0a','imp_yamaha-yb-125z-dx','Yamaha YB 125Z DX','en'),
('a_imp_yamaha-ybr-125_aae23279b8df','imp_yamaha-ybr-125','Yamaha YBR 125','en'),
('a_imp_yamaha-ybr-125g_8363b03e03e5','imp_yamaha-ybr-125g','Yamaha YBR 125G','en'),
('a_imp_yokohama-advan_805b16cb10dd','imp_yokohama-advan','Yokohama Advan','en'),
('a_imp_yokohama-bluearth_5c3c788eb9bc','imp_yokohama-bluearth','Yokohama BluEarth','en'),
('a_imp_yokohama-geolandar_84724ff7ff87','imp_yokohama-geolandar','Yokohama Geolandar','en'),
('a_imp_zambon-fluimucil_987a5a865c95','imp_zambon-fluimucil','Zambon Fluimucil','en'),
('a_imp_zic-m9_51f5b04fac19','imp_zic-m9','ZIC M9','en'),
('a_imp_zic-x5_fbfd987e23a6','imp_zic-x5','ZIC X5','en'),
('a_imp_zic-x7_0096261a36fa','imp_zic-x7','ZIC X7','en'),
('a_imp_zic-x9_96db2acc33b0','imp_zic-x9','ZIC X9','en'),
('a_meat_beef_99881b59741b','meat_beef','بڑا گوشت / گائے','ur'),
('a_meat_beef_8f1f76515c4e','meat_beef','Beef','roman'),
('a_meat_beef_dc8b63a8da42','meat_beef','Bara Gosht','roman'),
('a_meat_beef_b75ca56df476','meat_beef','Gaye ka Gosht','roman'),
('a_meat_chicken_a113f07bc2b3','meat_chicken','مرغی کا گوشت','ur'),
('a_meat_chicken_a9514f8884af','meat_chicken','Chicken','roman'),
('a_meat_chicken_b865170da5fd','meat_chicken','Murghi','roman'),
('a_meat_chicken_427b52c82bb4','meat_chicken','Murgh','roman'),
('a_meat_mutton_dd7ec24d2732','meat_mutton','چھوٹا گوشت / بکرا','ur'),
('a_meat_mutton_07035431c1ab','meat_mutton','Mutton','roman'),
('a_meat_mutton_f732bf9a4503','meat_mutton','Chota Gosht','roman'),
('a_meat_mutton_f6fd49af0712','meat_mutton','Bakra','roman'),
('a_pc_shampoo_2852a9eb6eca','pc_shampoo','شیمپو','ur'),
('a_pc_shampoo_2fb722dac2ab','pc_shampoo','Shampoo','roman'),
('a_pc_shampoo_424054a08257','pc_shampoo','Shampu','roman'),
('a_pc_shampoo_fceb463278f4','pc_shampoo','Sunsilk','roman'),
('a_pc_shampoo_963557b6c0d2','pc_shampoo','Head & Shoulders','roman'),
('a_pc_soap_cc3e27e34e29','pc_soap','نہانے کا صابن','ur'),
('a_pc_soap_dba04a09f44f','pc_soap','Sabun','roman'),
('a_pc_soap_c740969b60b7','pc_soap','Soap','roman'),
('a_pc_soap_5a397ddbe482','pc_soap','Lux','roman'),
('a_pc_soap_e6d4a4edf9ce','pc_soap','Lifebuoy','roman'),
('a_pc_soap_9d6941ebede1','pc_soap','Bath Soap','en'),
('a_pc_toothpaste_ccf2f62788c3','pc_toothpaste','ٹوتھ پیسٹ','ur'),
('a_pc_toothpaste_ac40b629767e','pc_toothpaste','Toothpaste','roman'),
('a_pc_toothpaste_51355bb68df9','pc_toothpaste','Colgate','roman'),
('a_pc_toothpaste_e64e8410837c','pc_toothpaste','Sensodyne','roman'),
('a_pc_toothpaste_07608778fb78','pc_toothpaste','Tooth Paste','roman'),
('a_personal_deodorant_7698c12938d7','personal_deodorant','باڈی اسپرے / ڈیوڈرینٹ','ur'),
('a_personal_deodorant_55fa20a0e853','personal_deodorant','Deodorant','roman'),
('a_personal_deodorant_f00712104b13','personal_deodorant','Body Spray','roman'),
('a_personal_deodorant_ed4dd6cc118a','personal_deodorant','Axe','roman'),
('a_personal_deodorant_8d9911885060','personal_deodorant','Fogg','roman'),
('a_personal_handwash_aaf019ce064c','personal_handwash','ہینڈ واش','ur'),
('a_personal_handwash_d89ffacaa81f','personal_handwash','Handwash','roman'),
('a_personal_handwash_c392062c33bc','personal_handwash','Hand Wash','roman'),
('a_personal_handwash_5add380ccd26','personal_handwash','Liquid Soap','roman'),
('a_pet_cat_food_ce1594228bf3','pet_cat_food','بلی کی خوراک','ur'),
('a_pet_cat_food_146ea39390aa','pet_cat_food','Cat Food','roman'),
('a_pet_cat_food_543a9ac1729e','pet_cat_food','Billi ki Khorak','roman'),
('a_pet_cat_food_9f6a18c714b1','pet_cat_food','Me-O','roman'),
('a_pet_cat_food_24f6eaf62b47','pet_cat_food','Whiskas','roman'),
('a_seafood_fish_d19a93b36c65','seafood_fish','مچھلی','ur'),
('a_seafood_fish_9bf08919c097','seafood_fish','Machli','roman'),
('a_seafood_fish_020609bbe2a5','seafood_fish','Machhli','roman'),
('a_seafood_fish_071642fa72ba','seafood_fish','Fish','roman'),
('a_seafood_prawns_5bcac3dba42a','seafood_prawns','جھینگا','ur'),
('a_seafood_prawns_252dff26ab11','seafood_prawns','Jheenga','roman'),
('a_seafood_prawns_4f8ba28f173e','seafood_prawns','Prawns','roman'),
('a_seafood_prawns_2f2e1847f0db','seafood_prawns','Shrimp','roman'),
('a_seafood_prawns_6bdf9189b314','seafood_prawns','Prawns / Shrimps','en'),
('a_spice_black_pepper_b318d23d631c','spice_black_pepper','کالی مرچ','ur'),
('a_spice_black_pepper_6955403b4bd7','spice_black_pepper','Kali Mirch','roman'),
('a_spice_black_pepper_5697f2e28d08','spice_black_pepper','Kaali Mirch','roman'),
('a_spice_black_pepper_158cd2088729','spice_black_pepper','Black Pepper','en'),
('a_spice_cardamom_9ca723b8798d','spice_cardamom','سبز الائچی','ur'),
('a_spice_cardamom_cae34d661bca','spice_cardamom','Elaichi','roman'),
('a_spice_cardamom_5fbf32a949c8','spice_cardamom','Choti Elaichi','roman'),
('a_spice_cardamom_d5e49871bce5','spice_cardamom','Sabz Elaichi','roman'),
('a_spice_cardamom_81b098314f49','spice_cardamom','Green Cardamom','en'),
('a_spice_cinnamon_2ff39f595c0c','spice_cinnamon','دار چینی','ur'),
('a_spice_cinnamon_41f3dfecdd55','spice_cinnamon','Dar Cheeni','roman'),
('a_spice_cinnamon_76dd4eb27628','spice_cinnamon','Dar Chini','roman'),
('a_spice_cinnamon_d37aebc79d54','spice_cinnamon','Dalchini','roman'),
('a_spice_cinnamon_fb4c74d473f8','spice_cinnamon','Cinnamon','en'),
('a_spice_cloves_2870432e1d3e','spice_cloves','لونگ','ur'),
('a_spice_cloves_97d57bf563ad','spice_cloves','Laung','roman'),
('a_spice_cloves_8394f0347c18','spice_cloves','Long','roman'),
('a_spice_cloves_6abb0d466994','spice_cloves','Cloves','en'),
('a_spice_coriander_powder_2a34e4f714cc','spice_coriander_powder','پسا دھنیا','ur'),
('a_spice_coriander_powder_ccd9a311c97f','spice_coriander_powder','Pisa Dhaniya','roman'),
('a_spice_coriander_powder_b39031a2c35e','spice_coriander_powder','Dhaniya Powder','roman'),
('a_spice_coriander_powder_15ee370f531b','spice_coriander_powder','Coriander Powder','en'),
('a_spice_cumin_e3a5fc37ccab','spice_cumin','سفید زیرہ','ur'),
('a_spice_cumin_6309f19b56a1','spice_cumin','Zeera','roman'),
('a_spice_cumin_757896fd786b','spice_cumin','Zira','roman'),
('a_spice_cumin_c3ec546a61b8','spice_cumin','Safaid Zeera','roman'),
('a_spice_cumin_2e41bc56c83e','spice_cumin','Cumin (Zeera)','en'),
('a_spice_fennel_cfe19bda5845','spice_fennel','سونف','ur'),
('a_spice_fennel_7215b5b3ecb6','spice_fennel','Saunf','roman'),
('a_spice_fennel_6c29b6c97cfe','spice_fennel','Sonf','roman'),
('a_spice_fennel_d389ec8b5bd4','spice_fennel','Fennel Seeds','en'),
('a_spice_fenugreek_c691252ddbd8','spice_fenugreek','میتھی دانہ','ur'),
('a_spice_fenugreek_6fc3cb4ccd76','spice_fenugreek','Methi Dana','roman'),
('a_spice_fenugreek_967d83b40665','spice_fenugreek','Maithi','roman'),
('a_spice_fenugreek_3c61f57438d8','spice_fenugreek','Fenugreek Seeds','en'),
('a_spice_mixed_c89f88412d53','spice_mixed','مصالحہ جات','ur'),
('a_spice_mixed_34c69b1d4744','spice_mixed','Spices','roman'),
('a_spice_mixed_3a5951c09df6','spice_mixed','Masala','roman'),
('a_spice_mixed_df6052c1d1c7','spice_mixed','Garam Masala','roman'),
('a_spice_red_chili_5b2110589526','spice_red_chili','سرخ مرچ پاؤڈر','ur'),
('a_spice_red_chili_13f17c2f85a1','spice_red_chili','Lal Mirch','roman'),
('a_spice_red_chili_ccac8742c857','spice_red_chili','Surkh Mirch','roman'),
('a_spice_red_chili_48bbb4473df6','spice_red_chili','Kuti Lal Mirch','roman'),
('a_spice_red_chili_5043d16ffd50','spice_red_chili','Red Chili Powder','en'),
('a_spice_tikka_masala_4ed4aec45cb2','spice_tikka_masala','تکہ مصالحہ','ur'),
('a_spice_tikka_masala_99c1fb5a52db','spice_tikka_masala','Tikka Masala','roman'),
('a_spice_tikka_masala_9b97301d17f3','spice_tikka_masala','BBQ Masala','roman'),
('a_spice_tikka_masala_8859a92464db','spice_tikka_masala','Tikka Boti Masala','roman'),
('a_spice_turmeric_c74e320f5ca5','spice_turmeric','ہلدی','ur'),
('a_spice_turmeric_9433014f7f14','spice_turmeric','Haldi','roman'),
('a_spice_turmeric_0eccde5e1c6b','spice_turmeric','Huldi','roman'),
('a_spice_turmeric_80be4f5f1cd4','spice_turmeric','Turmeric Powder','en'),
('a_stat_ballpoint_pen_dc5d0085f923','stat_ballpoint_pen','بال پوائنٹ پین','ur'),
('a_stat_ballpoint_pen_ef829858697f','stat_ballpoint_pen','Pen','roman'),
('a_stat_ballpoint_pen_cd11f8a7eed3','stat_ballpoint_pen','Ballpoint','roman'),
('a_stat_ballpoint_pen_e00da568b388','stat_ballpoint_pen','Ball Point','roman'),
('a_stat_ballpoint_pen_b262e5a0fc3d','stat_ballpoint_pen','Ballpoint Pen','en'),
('a_stat_notebook_271b9d439983','stat_notebook','رجسٹر / کاپی','ur'),
('a_stat_notebook_3a4f8d88ea1e','stat_notebook','Notebook','roman'),
('a_stat_notebook_0ba7583639a2','stat_notebook','Register','roman'),
('a_stat_notebook_5fb63579fc98','stat_notebook','Copy','roman'),
('a_veg_coriander_d3203a5fb531','veg_coriander','دھنیا','ur'),
('a_veg_coriander_e3229e54b4de','veg_coriander','Dhaniya','roman'),
('a_veg_coriander_f4f48facd04c','veg_coriander','Dhania','roman'),
('a_veg_coriander_d66571e2777c','veg_coriander','Hara Dhaniya','roman'),
('a_veg_coriander_80766a792c83','veg_coriander','Coriander','en'),
('a_veg_garlic_e5fbc93bc984','veg_garlic','لہسن','ur'),
('a_veg_garlic_4909fba39b3a','veg_garlic','Lehsan','roman'),
('a_veg_garlic_8c3bc5a510ba','veg_garlic','Lahsan','roman'),
('a_veg_garlic_334dd0cc11b8','veg_garlic','Lehsun','roman'),
('a_veg_garlic_26f556ab266d','veg_garlic','Garlic','en'),
('a_veg_ginger_9e3e219f44a5','veg_ginger','ادرک','ur'),
('a_veg_ginger_fdd53a96c10b','veg_ginger','Adrak','roman'),
('a_veg_ginger_1aff663e9bcf','veg_ginger','Aadrak','roman'),
('a_veg_ginger_63e3363dabd9','veg_ginger','Ginger','en'),
('a_veg_green_chili_c127ed8be42f','veg_green_chili','ہری مرچ','ur'),
('a_veg_green_chili_569501117cae','veg_green_chili','Hari Mirch','roman'),
('a_veg_green_chili_b49c6437d029','veg_green_chili','Hri Mirch','roman'),
('a_veg_green_chili_d198b697d97a','veg_green_chili','Sabz Mirch','roman'),
('a_veg_green_chili_f3b37eaa6a79','veg_green_chili','Hari Mirchi','roman'),
('a_veg_green_chili_f98d05872473','veg_green_chili','Green Chili','en'),
('a_veg_lemon_6ca0d664609f','veg_lemon','لیموں','ur'),
('a_veg_lemon_33b550055851','veg_lemon','Leemu','roman'),
('a_veg_lemon_e3183a0a9d2c','veg_lemon','Limu','roman'),
('a_veg_lemon_b766feddceb9','veg_lemon','Nimbu','roman'),
('a_veg_lemon_ff71ff25b2b0','veg_lemon','Lemon','roman'),
('a_veg_mint_acbb9514b589','veg_mint','پودینہ','ur'),
('a_veg_mint_00880f8f22d8','veg_mint','Podina','roman'),
('a_veg_mint_dc719043418b','veg_mint','Pudina','roman'),
('a_veg_mint_64d3ac79ed1f','veg_mint','Podeena','roman'),
('a_veg_mint_ca8a196f97a4','veg_mint','Mint','en'),
('a_veg_onion_0de21a0557d0','veg_onion','پیاز','ur'),
('a_veg_onion_43d5631c0441','veg_onion','Pyaz','roman'),
('a_veg_onion_0e9b1ea3a6d6','veg_onion','Pyaaz','roman'),
('a_veg_onion_acb5229dd509','veg_onion','Piyaz','roman'),
('a_veg_onion_a3df3d89117c','veg_onion','Piaz','roman'),
('a_veg_onion_8eaa10d1a33a','veg_onion','Onion','en'),
('a_veg_potato_485e28214451','veg_potato','آلو','ur'),
('a_veg_potato_0ced46c235ee','veg_potato','Aloo','roman'),
('a_veg_potato_a8c9c13bba98','veg_potato','Alu','roman'),
('a_veg_potato_c55f7ebccfd1','veg_potato','Alo','roman'),
('a_veg_potato_1f49cad97a42','veg_potato','Aalu','roman'),
('a_veg_potato_bb8e09a31294','veg_potato','Potato','en'),
('a_veg_spinach_22ae81a58744','veg_spinach','پالک','ur'),
('a_veg_spinach_f87c0468fe0d','veg_spinach','Palak','roman'),
('a_veg_spinach_ff67e244c4c9','veg_spinach','Paalak','roman'),
('a_veg_spinach_4a112dd0513c','veg_spinach','Spinach','en'),
('a_veg_tomato_b3937fd30c9d','veg_tomato','ٹماٹر','ur'),
('a_veg_tomato_c4c5d94c8b83','veg_tomato','Tamatar','roman'),
('a_veg_tomato_1c6ecf9c9d52','veg_tomato','Tamaatar','roman'),
('a_veg_tomato_857d6743d166','veg_tomato','Tmatar','roman'),
('a_veg_tomato_77bd79b3dca1','veg_tomato','Tomato','en')
ON CONFLICT (id) DO NOTHING;
