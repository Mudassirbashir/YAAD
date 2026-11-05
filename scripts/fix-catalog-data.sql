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
-- Part 3: seed aliases (id is uuid type: use gen_random_uuid(); NOT EXISTS keeps it idempotent)
INSERT INTO public.item_aliases (id, item_id, alias, language)
SELECT gen_random_uuid(), v.item_id, v.alias, v.language
FROM (VALUES
('baby_cerelac','سیریلاک','ur'),
('baby_cerelac','Cerelac','roman'),
('baby_cerelac','Baby Cereal','roman'),
('baby_cerelac','Nestle Cerelac','roman'),
('baby_cerelac','Cerelac Baby Food','en'),
('baby_diapers','ڈائپرز / پیمپرز','ur'),
('baby_diapers','Diapers','roman'),
('baby_diapers','Pampers','roman'),
('baby_diapers','Baby Diaper','roman'),
('baby_diapers','Baby Diapers','en'),
('bakery_biscuits','بسکٹ','ur'),
('bakery_biscuits','Biscuits','roman'),
('bakery_biscuits','Biscut','roman'),
('bakery_biscuits','Cookies','roman'),
('bakery_bread','ڈبل روٹی','ur'),
('bakery_bread','Bread','roman'),
('bakery_bread','Double Roti','roman'),
('bakery_bread','Dawn Bread','roman'),
('bakery_buns','برگر بن','ur'),
('bakery_buns','Buns','roman'),
('bakery_buns','Burger Buns','roman'),
('bakery_buns','Bun','roman'),
('bakery_cake','کیک','ur'),
('bakery_cake','Cake','roman'),
('bakery_cake','Tea Cake','roman'),
('bakery_cake','Fruit Cake','roman'),
('bakery_paratha','پراٹھا','ur'),
('bakery_paratha','Paratha','roman'),
('bakery_paratha','Frozen Paratha','roman'),
('bakery_paratha','Lachha Paratha','roman'),
('bakery_rusks','رس / کیک رس','ur'),
('bakery_rusks','Rusk','roman'),
('bakery_rusks','Cake Rusk','roman'),
('bakery_rusks','Rusks','en'),
('bev_mineral_water','منرل واٹر / پانی','ur'),
('bev_mineral_water','Mineral Water','roman'),
('bev_mineral_water','Paani','roman'),
('bev_mineral_water','Nestle Water','roman'),
('bev_rooh_afza','روح افزا','ur'),
('bev_rooh_afza','Rooh Afza','roman'),
('bev_rooh_afza','Jam e Shirin','roman'),
('bev_rooh_afza','Lal Sharbat','roman'),
('clean_dishwash','برتن دھونے کا صابن / وم','ur'),
('clean_dishwash','Dishwash','roman'),
('clean_dishwash','Bartan ka Sabun','roman'),
('clean_dishwash','Vim Bar','roman'),
('clean_dishwash','Lemon Max','roman'),
('clean_dishwash','Dish Soap','roman'),
('clean_dishwash','Dishwashing Soap','en'),
('clean_harpic','ہارپک / ٹوائلٹ کلینر','ur'),
('clean_harpic','Harpic','roman'),
('clean_harpic','Toilet Cleaner','roman'),
('clean_mop','جھاڑو اور پوچھا','ur'),
('clean_mop','Mop','roman'),
('clean_mop','Broom','roman'),
('clean_mop','Jharoo','roman'),
('clean_mop','Pocha','roman'),
('clean_mop','Mop / Broom','en'),
('clean_phenyl','فنائل','ur'),
('clean_phenyl','Phenyl','roman'),
('clean_phenyl','Finail','roman'),
('clean_phenyl','Floor Cleaner','roman'),
('clean_surf','سرف / واشنگ پاؤڈر','ur'),
('clean_surf','Surf','roman'),
('clean_surf','Washing Powder','roman'),
('clean_surf','Surf Excel','roman'),
('clean_surf','Ariel','roman'),
('clean_surf','Bonus','roman'),
('cloth_socks','جرابیں','ur'),
('cloth_socks','Jurabein','roman'),
('cloth_socks','Socks','roman'),
('cloth_socks','Mojay','roman'),
('dairy_butter','مکھن','ur'),
('dairy_butter','Makhan','roman'),
('dairy_butter','Makkhan','roman'),
('dairy_butter','Butter','roman'),
('dairy_cheese','پنیر','ur'),
('dairy_cheese','Cheese','roman'),
('dairy_cheese','Paneer','roman'),
('dairy_cream','بالائی / کریم','ur'),
('dairy_cream','Cream','roman'),
('dairy_cream','Malai','roman'),
('dairy_cream','Balai','roman'),
('dairy_cream','Fresh Cream','en'),
('dairy_milk','دودھ','ur'),
('dairy_milk','Doodh','roman'),
('dairy_milk','Dudh','roman'),
('dairy_milk','Tetra Pak Milk','roman'),
('dairy_milk','Olpers','roman'),
('dairy_milk','Milkpak','roman'),
('dairy_milk','Fresh Milk','en'),
('dairy_yogurt','دہی','ur'),
('dairy_yogurt','Dahi','roman'),
('dairy_yogurt','Dahii','roman'),
('dairy_yogurt','Curd','roman'),
('dairy_yogurt','Yogurt','en'),
('eggs_farm','انڈے','ur'),
('eggs_farm','Anday','roman'),
('eggs_farm','Ande','roman'),
('eggs_farm','Enday','roman'),
('eggs_farm','Ende','roman'),
('eggs_farm','Eggs','roman'),
('fruit_apple','سیب','ur'),
('fruit_apple','Saib','roman'),
('fruit_apple','Seb','roman'),
('fruit_apple','Sayb','roman'),
('fruit_apple','Apple','en'),
('fruit_banana','کیلا','ur'),
('fruit_banana','Kela','roman'),
('fruit_banana','Kayla','roman'),
('fruit_banana','Keela','roman'),
('fruit_banana','Banana','en'),
('fruit_grapes','انگور','ur'),
('fruit_grapes','Angoor','roman'),
('fruit_grapes','Angur','roman'),
('fruit_grapes','Grapes','en'),
('fruit_guava','امرود','ur'),
('fruit_guava','Amrood','roman'),
('fruit_guava','Amrud','roman'),
('fruit_guava','Guava','en'),
('fruit_mango','آم','ur'),
('fruit_mango','Aam','roman'),
('fruit_mango','Am','roman'),
('fruit_mango','Mango','en'),
('fruit_orange','مالٹا','ur'),
('fruit_orange','Malta','roman'),
('fruit_orange','Kinnow','roman'),
('fruit_orange','Kino','roman'),
('fruit_orange','Mausambi','roman'),
('fruit_orange','Orange','en'),
('fruit_pomegranate','انار','ur'),
('fruit_pomegranate','Anaar','roman'),
('fruit_pomegranate','Anar','roman'),
('fruit_pomegranate','Pomegranate','en'),
('groc_coffee','کافی','ur'),
('groc_coffee','Coffee','roman'),
('groc_coffee','Cofee','roman'),
('groc_cooking_oil','کوکنگ آئل','ur'),
('groc_cooking_oil','Cooking Oil','roman'),
('groc_cooking_oil','Tail','roman'),
('groc_cooking_oil','Tel','roman'),
('groc_flour','آٹا','ur'),
('groc_flour','Atta','roman'),
('groc_flour','Aata','roman'),
('groc_flour','Chakki Atta','roman'),
('groc_flour','Wheat Flour','en'),
('groc_ghee','گھی','ur'),
('groc_ghee','Ghee','roman'),
('groc_ghee','Banaspati Ghee','roman'),
('groc_ghee','Desi Ghee','roman'),
('groc_lentils','دال','ur'),
('groc_lentils','Daal','roman'),
('groc_lentils','Dal','roman'),
('groc_lentils','Daal Chana','roman'),
('groc_lentils','Daal Moong','roman'),
('groc_lentils','Lentils (Daal)','en'),
('groc_rice','چاول','ur'),
('groc_rice','Chawal','roman'),
('groc_rice','Basmati Chawal','roman'),
('groc_rice','Kainat Chawal','roman'),
('groc_rice','Basmati Rice','en'),
('groc_salt','نمک','ur'),
('groc_salt','Namak','roman'),
('groc_salt','National Namak','roman'),
('groc_salt','Salt','en'),
('groc_sugar','چینی','ur'),
('groc_sugar','Chini','roman'),
('groc_sugar','Cheeni','roman'),
('groc_sugar','Chinni','roman'),
('groc_sugar','Sugar','en'),
('groc_tea','چائے کی پتی','ur'),
('groc_tea','Chai','roman'),
('groc_tea','Patti','roman'),
('groc_tea','Chai Patti','roman'),
('groc_tea','Tea (Chai Patti)','en'),
('health_dettol','ڈیٹول مائع','ur'),
('health_dettol','Dettol','roman'),
('health_dettol','Dettol Liquid','roman'),
('health_dettol','Dettol Antiseptic','en'),
('health_panadol','پیناڈول / پیراسیٹامول','ur'),
('health_panadol','Panadol','roman'),
('health_panadol','Paracetamol','roman'),
('health_panadol','Disprin','roman'),
('health_panadol','Paracetamol (Panadol)','en'),
('health_saniplast','سنی پلاس / پٹی','ur'),
('health_saniplast','Saniplast','roman'),
('health_saniplast','Bandage','roman'),
('health_saniplast','Plaster','roman'),
('health_saniplast','Bandage (Saniplast)','en'),
('herbal_ajwain','اجوائن','ur'),
('herbal_ajwain','Ajwain','roman'),
('herbal_ajwain','Ajwaen','roman'),
('herbal_ajwain','Ajwan','roman'),
('herbal_ajwain','Carom Seeds (Ajwain)','en'),
('herbal_alum','پھٹکری','ur'),
('herbal_alum','Phitkari','roman'),
('herbal_alum','Fitkari','roman'),
('herbal_alum','Phatkari','roman'),
('herbal_alum','Phatakari','roman'),
('herbal_alum','Alum','en'),
('herbal_isabgol','اسپغول چھلکا','ur'),
('herbal_isabgol','Isabgol','roman'),
('herbal_isabgol','Ispaghol','roman'),
('herbal_isabgol','Ispaghol Chilka','roman'),
('herbal_isabgol','Psyllium Husk (Isabgol)','en'),
('herbal_kalonji','کلونجی','ur'),
('herbal_kalonji','Kalonji','roman'),
('herbal_kalonji','Kalwanji','roman'),
('herbal_kalonji','Black Seeds','roman'),
('herbal_kalonji','Nigella Seeds (Kalonji)','en'),
('herbal_mulethi','ملٹھی','ur'),
('herbal_mulethi','Mulethi','roman'),
('herbal_mulethi','Mulathi','roman'),
('herbal_mulethi','Licorice Root','en'),
('herbal_senna','ثنا مکی','ur'),
('herbal_senna','Sana Makki','roman'),
('herbal_senna','Sana al Makki','roman'),
('herbal_senna','Senna Leaves','en'),
('hh_tissue_roll','ٹشو رول','ur'),
('hh_tissue_roll','Tissue','roman'),
('hh_tissue_roll','Tissue Roll','roman'),
('hh_tissue_roll','Rose Petal','roman'),
('hh_trash_bags','کچرے کے شاپر','ur'),
('hh_trash_bags','Trash Bags','roman'),
('hh_trash_bags','Kachra Bag','roman'),
('hh_trash_bags','Shopper','roman'),
('home_towel','تولیہ','ur'),
('home_towel','Towel','roman'),
('home_towel','Toliya','roman'),
('home_towel','Towal','roman'),
('home_towel','Bath Towel','en'),
('household_charcoal','کوئلہ','ur'),
('household_charcoal','Koyla','roman'),
('household_charcoal','Charcoal','roman'),
('household_charcoal','Koela','roman'),
('hw_led_bulb','ایل ای ڈی بلب','ur'),
('hw_led_bulb','LED Bulb','roman'),
('hw_led_bulb','Bulb','roman'),
('hw_led_bulb','Light Bulb','roman'),
('hw_limestone','چونا','ur'),
('hw_limestone','Choona','roman'),
('hw_limestone','Chuna','roman'),
('hw_limestone','Limestone','en'),
('hw_super_glue','ایلفی / گلو','ur'),
('hw_super_glue','Elfy','roman'),
('hw_super_glue','Alfy','roman'),
('hw_super_glue','Super Glue','roman'),
('hw_super_glue','Super Glue (Elfy)','en'),
('imp_7up-7up','7UP 500ml','en'),
('imp_abbott-acefyl','Abbott Acefyl','en'),
('imp_abbott-arinac','Abbott Arinac','en'),
('imp_abbott-arinac-forte','Abbott Arinac Forte','en'),
('imp_abbott-brexin','Abbott Brexin','en'),
('imp_abbott-brufen','Abbott Brufen','en'),
('imp_abbott-creon','Abbott Creon','en'),
('imp_abbott-dicetel','Abbott Dicetel','en'),
('imp_abbott-duphalac','Abbott Duphalac','en'),
('imp_abbott-duspatalin','Abbott Duspatalin','en'),
('imp_abbott-ensure','Abbott Ensure','en'),
('imp_abbott-ganaton','Abbott Ganaton','en'),
('imp_abbott-hidrasec','Abbott Hidrasec','en'),
('imp_abbott-influvac','Abbott Influvac','en'),
('imp_abbott-limcee-vitamin-c','Abbott Limcee Vitamin C','en'),
('imp_abbott-osnate-d','Abbott Osnate-D','en'),
('imp_abbott-pedialyte','Abbott Pedialyte','en'),
('imp_abbott-pediasure','Abbott PediaSure','en'),
('imp_abbott-surbex-z','Abbott Surbex-Z','en'),
('imp_abbott-synflex','Abbott Synflex','en'),
('imp_abbott-vidaylin','Abbott Vidaylin','en'),
('imp_abro-spray-paint','ABRO Spray Paint','en'),
('imp_acer-aspire','Acer Aspire','en'),
('imp_acer-nitro','Acer Nitro','en'),
('imp_acer-swift','Acer Swift','en'),
('imp_adam-revo','Adam Revo','en'),
('imp_ags-gl-100','AGS GL 100','en'),
('imp_ags-gl-50','AGS GL 50','en'),
('imp_ags-gl-65','AGS GL 65','en'),
('imp_ags-gl-85','AGS GL 85','en'),
('imp_ags-hb-100','AGS HB 100','en'),
('imp_always-always-sanitary-pads','Always Sanitary Pads','en'),
('imp_american-garden-creamy-peanut-butter','American Garden Creamy Peanut Butter','en'),
('imp_american-garden-crunchy-peanut-butter','American Garden Crunchy Peanut Butter','en'),
('imp_anex-citrus-juicer','Anex Citrus Juicer','en'),
('imp_anex-deep-fryer','Anex Deep Fryer','en'),
('imp_anex-dry-iron','Anex Dry Iron','en'),
('imp_anex-electric-kettle','Anex Electric Kettle','en'),
('imp_anex-food-processor','Anex Food Processor','en'),
('imp_anex-juicer-blender','Anex Juicer Blender','en'),
('imp_anex-meat-grinder','Anex Meat Grinder','en'),
('imp_anex-room-heater','Anex Room Heater','en'),
('imp_anex-steam-iron','Anex Steam Iron','en'),
('imp_anker-power-bank','Anker Power Bank','en'),
('imp_anker-soundcore-q20i','Anker Soundcore Q20i','en'),
('imp_anker-soundcore-r50i','Anker Soundcore R50i','en'),
('imp_anker-usb-c-cable','Anker USB-C Cable','en'),
('imp_anker-wall-charger','Anker Wall Charger','en'),
('imp_apple-airpods','Apple AirPods','en'),
('imp_apple-imac','Apple iMac','en'),
('imp_apple-iphone-13','Apple iPhone 13','en'),
('imp_apple-iphone-14','Apple iPhone 14','en'),
('imp_apple-iphone-15','Apple iPhone 15','en'),
('imp_apple-iphone-16','Apple iPhone 16','en'),
('imp_apple-macbook-air','Apple MacBook Air','en'),
('imp_apple-macbook-pro','Apple MacBook Pro','en'),
('imp_apple-watch-se','Apple Watch SE','en'),
('imp_aquafina-aquafina','Aquafina 500ml','en'),
('imp_areon-ken','Areon Ken','en'),
('imp_ariel-ariel-complete-detergent-powder','Ariel Complete Detergent Powder 1kg','en'),
('imp_ariel-ariel-matic-front-load-detergent','Ariel Matic Front Load Detergent 1kg','en'),
('imp_ariel-ariel-matic-top-load-detergent','Ariel Matic Top Load Detergent 1kg','en'),
('imp_armor-all-original-protectant','Armor All Original Protectant','en'),
('imp_asia-super-kernel-basmati-rice','Asia Super Kernel Basmati Rice 5kg','en'),
('imp_astrazeneca-bricanyl','AstraZeneca Bricanyl','en'),
('imp_astrazeneca-pulmicort','AstraZeneca Pulmicort','en'),
('imp_astrazeneca-rhinocort','AstraZeneca Rhinocort','en'),
('imp_astrazeneca-symbicort','AstraZeneca Symbicort','en'),
('imp_astrazeneca-xylocaine','AstraZeneca Xylocaine','en'),
('imp_asus-rog','Asus ROG','en'),
('imp_asus-tuf-gaming','Asus TUF Gaming','en'),
('imp_asus-vivobook','Asus VivoBook','en'),
('imp_audi-a4','Audi A4','en'),
('imp_audi-a6','Audi A6','en'),
('imp_audi-q5','Audi Q5','en'),
('imp_audionic-airbud-tws-earbuds','Audionic Airbud TWS Earbuds','en'),
('imp_audionic-bluetooth-handsfree','Audionic Bluetooth Handsfree','en'),
('imp_audionic-bluetooth-speaker','Audionic Bluetooth Speaker','en'),
('imp_audionic-power-bank','Audionic Power Bank','en'),
('imp_audionic-tws-earbuds','Audionic TWS Earbuds','en'),
('imp_audionic-wall-charger','Audionic Wall Charger','en'),
('imp_audionic-wired-handsfree','Audionic Wired Handsfree','en'),
('imp_axe-axe-apollo-body-spray','Axe Apollo Body Spray 150ml','en'),
('imp_axe-axe-dark-temptation-body-spray','Axe Dark Temptation Body Spray 150ml','en'),
('imp_axe-axe-ice-chill-body-spray','Axe Ice Chill Body Spray 150ml','en'),
('imp_baic-bj40','BAIC BJ40','en'),
('imp_baic-x25','BAIC X25','en'),
('imp_bake-parlour-chocolate-vermicelli','Bake Parlour Chocolate Vermicelli','en'),
('imp_bake-parlour-colour-vermicelli','Bake Parlour Colour Vermicelli','en'),
('imp_bake-parlour-vermicelli','Bake Parlour Vermicelli','en'),
('imp_band-aid-band-aid-adhesive-bandages','Band-Aid Adhesive Bandages','en'),
('imp_baseus-power-bank','Baseus Power Bank','en'),
('imp_baseus-usb-cable','Baseus USB Cable','en'),
('imp_bayer-canesten','Bayer Canesten','en'),
('imp_bayer-clarityn','Bayer Clarityn','en'),
('imp_bayer-redoxon-vitamin-c','Bayer Redoxon Vitamin C','en'),
('imp_bayer-scheriproct','Bayer Scheriproct','en'),
('imp_bayer-supradyn','Bayer Supradyn','en'),
('imp_betadine-betadine-antiseptic-solution','Betadine Antiseptic Solution','en'),
('imp_bisconni-choco-chip-cookies','Bisconni Choco Chip Cookies','en'),
('imp_bisconni-chocolatto','Bisconni Chocolatto','en'),
('imp_bisconni-rite-chocolate-vanilla','Bisconni Rite Chocolate & Vanilla','en'),
('imp_bmw-3-series','BMW 3 Series','en'),
('imp_bmw-5-series','BMW 5 Series','en'),
('imp_bmw-x5','BMW X5','en'),
('imp_boehringer-ingelheim-atrovent','Boehringer Ingelheim Atrovent','en'),
('imp_boehringer-ingelheim-combivent','Boehringer Ingelheim Combivent','en'),
('imp_boehringer-ingelheim-mobic','Boehringer Ingelheim Mobic','en'),
('imp_boehringer-ingelheim-spiriva','Boehringer Ingelheim Spiriva','en'),
('imp_bonapapa-bonapapa-baby-diapers','BonaPapa Baby Diapers','en'),
('imp_bonus-bonus-detergent-powder','Bonus Detergent Powder 1kg','en'),
('imp_bosch-spark-plug','Bosch Spark Plug','en'),
('imp_bosch-wiper-blade','Bosch Wiper Blade','en'),
('imp_bridgestone-b290','Bridgestone B290','en'),
('imp_bridgestone-dueler','Bridgestone Dueler','en'),
('imp_bridgestone-ecopia','Bridgestone Ecopia','en'),
('imp_bridgestone-potenza','Bridgestone Potenza','en'),
('imp_bridgestone-turanza','Bridgestone Turanza','en'),
('imp_brite-brite-detergent-powder','Brite Detergent Powder 1kg','en'),
('imp_bunnys-spicy-mix-nimko','Bunnys Spicy Mix Nimko','en'),
('imp_burnol-burnol-burn-cream','Burnol Burn Cream','en'),
('imp_cadbury-5-star','Cadbury 5 Star','en'),
('imp_cadbury-bournvita','Cadbury Bournvita','en'),
('imp_cadbury-dairy-milk-classic','Cadbury Dairy Milk Classic','en'),
('imp_cadbury-dairy-milk-fruit-nut','Cadbury Dairy Milk Fruit & Nut','en'),
('imp_cadbury-eclairs','Cadbury Eclairs','en'),
('imp_cadbury-mini-fingers','Cadbury Mini Fingers','en'),
('imp_cadbury-perk','Cadbury Perk','en'),
('imp_caltex-delo','Caltex Delo','en'),
('imp_caltex-havoline-formula','Caltex Havoline Formula','en'),
('imp_canbebe-canbebe-baby-diapers','Canbebe Baby Diapers','en'),
('imp_candyland-chilli-milli','Candyland Chilli Milli','en'),
('imp_candyland-now','Candyland Now','en'),
('imp_candyland-sonnet-chocolate','Candyland Sonnet Chocolate','en'),
('imp_canon-cooking-range','Canon Cooking Range','en'),
('imp_canon-electric-geyser','Canon Electric Geyser','en'),
('imp_canon-gas-geyser','Canon Gas Geyser','en'),
('imp_canon-pixma-printer','Canon PIXMA Printer','en'),
('imp_capri-capri-beauty-soap','Capri Beauty Soap','en'),
('imp_ccl-gabanet','CCL Gabanet','en'),
('imp_centrum-centrum-multivitamin','Centrum Multivitamin','en'),
('imp_changan-alsvin','Changan Alsvin','en'),
('imp_changan-karvaan','Changan Karvaan','en'),
('imp_changan-m9-sherpa','Changan M9 Sherpa','en'),
('imp_changan-m9-sherpa-power-1-2l','Changan M9 Sherpa Power 1.2L','en'),
('imp_changan-oshan-x7','Changan Oshan X7','en'),
('imp_changan-oshan-x7-futuresense','Changan Oshan X7 FutureSense','en'),
('imp_changhong-ruba-air-conditioner','Changhong Ruba Air Conditioner','en'),
('imp_changhong-ruba-led-tv','Changhong Ruba LED TV','en'),
('imp_changhong-ruba-refrigerator','Changhong Ruba Refrigerator','en'),
('imp_cheetos-puffs-ketchup','Cheetos Puffs Ketchup','en'),
('imp_chevrolet-joy','Chevrolet Joy','en'),
('imp_chevrolet-optra','Chevrolet Optra','en'),
('imp_chupa-chups-chupa-chups','Chupa Chups','en'),
('imp_clear-clear-complete-active-care-shampoo','Clear Complete Active Care Shampoo','en'),
('imp_clear-clear-cool-sport-menthol-shampoo','Clear Cool Sport Menthol Shampoo','en'),
('imp_clear-clear-men-cool-sport-menthol-shampoo','Clear Men Cool Sport Menthol Shampoo','en'),
('imp_clear-clear-men-deep-cleanse-shampoo','Clear Men Deep Cleanse Shampoo','en'),
('imp_clearblue-clearblue-pregnancy-test','Clearblue Pregnancy Test','en'),
('imp_close-up-close-up-menthol-fresh-toothpaste','Close-Up Menthol Fresh Toothpaste','en'),
('imp_close-up-close-up-red-hot-toothpaste','Close-Up Red Hot Toothpaste','en'),
('imp_coca-cola-coca-cola-classic','Coca-Cola Classic 500ml','en'),
('imp_coca-cola-coca-cola-zero','Coca-Cola Zero 500ml','en'),
('imp_colgate-colgate-herbal-toothpaste','Colgate Herbal Toothpaste','en'),
('imp_colgate-colgate-maxfresh-toothpaste','Colgate MaxFresh Toothpaste','en'),
('imp_colgate-colgate-maximum-cavity-protection-toothp','Colgate Maximum Cavity Protection Toothpaste','en'),
('imp_colgate-colgate-slim-soft-toothbrush','Colgate Slim Soft Toothbrush','en'),
('imp_colgate-colgate-total-12-toothpaste','Colgate Total 12 Toothpaste','en'),
('imp_comfort-comfort-morning-fresh-fabric-conditioner','Comfort Morning Fresh Fabric Conditioner 500ml','en'),
('imp_dabur-dabur-amla-hair-oil','Dabur Amla Hair Oil','en'),
('imp_daewoo-cielo','Daewoo Cielo','en'),
('imp_daewoo-dls-65','Daewoo DLS 65','en'),
('imp_daewoo-racer','Daewoo Racer','en'),
('imp_daihatsu-cuore','Daihatsu Cuore','en'),
('imp_daihatsu-mira','Daihatsu Mira','en'),
('imp_daihatsu-move','Daihatsu Move','en'),
('imp_dairy-omung-milk','Dairy Omung Milk 1L','en'),
('imp_dalda-banaspati','Dalda Banaspati 5kg','en'),
('imp_dalda-cooking-oil','Dalda Cooking Oil 5L','en'),
('imp_danpak-crispy-king-double-chocolate-biscuit-stic','Danpak Crispy King Double Chocolate Biscuit Sticks','en'),
('imp_dany-handsfree','Dany Handsfree','en'),
('imp_dany-power-bank','Dany Power Bank','en'),
('imp_dany-tws-earbuds','Dany TWS Earbuds','en'),
('imp_dawlance-cooking-range','Dawlance Cooking Range','en'),
('imp_dawlance-deep-freezer','Dawlance Deep Freezer','en'),
('imp_dawlance-french-door-refrigerator','Dawlance French Door Refrigerator','en'),
('imp_dawlance-front-load-automatic-washing-machine','Dawlance Front Load Automatic Washing Machine','en'),
('imp_dawlance-inverter-air-conditioner','Dawlance Inverter Air Conditioner','en'),
('imp_dawlance-inverter-refrigerator','Dawlance Inverter Refrigerator','en'),
('imp_dawlance-led-tv','Dawlance LED TV','en'),
('imp_dawlance-microwave-oven','Dawlance Microwave Oven','en'),
('imp_dawlance-side-by-side-refrigerator','Dawlance Side-by-Side Refrigerator','en'),
('imp_dawlance-split-air-conditioner','Dawlance Split Air Conditioner','en'),
('imp_dawlance-top-load-automatic-washing-machine','Dawlance Top Load Automatic Washing Machine','en'),
('imp_dawn-milky-bread','Dawn Milky Bread','en'),
('imp_dawn-whole-wheat-bread','Dawn Whole Wheat Bread','en'),
('imp_dell-desktop-pc','Dell Desktop PC','en'),
('imp_dell-inspiron-15','Dell Inspiron 15','en'),
('imp_dell-latitude','Dell Latitude','en'),
('imp_dell-monitor','Dell Monitor','en'),
('imp_dell-vostro','Dell Vostro','en'),
('imp_dell-xps','Dell XPS','en'),
('imp_dettol-dettol-antiseptic-liquid','Dettol Antiseptic Liquid 250ml','en'),
('imp_dettol-dettol-cool-liquid-handwash','Dettol Cool Liquid Handwash 200ml','en'),
('imp_dettol-dettol-cool-soap','Dettol Cool Soap','en'),
('imp_dettol-dettol-original-liquid-handwash','Dettol Original Liquid Handwash 200ml','en'),
('imp_dettol-dettol-original-soap','Dettol Original Soap','en'),
('imp_dettol-dettol-shaving-cream-fresh','Dettol Shaving Cream Fresh 78g','en'),
('imp_dettol-dettol-skincare-liquid-handwash','Dettol Skincare Liquid Handwash 200ml','en'),
('imp_dettol-dettol-skincare-soap','Dettol Skincare Soap','en'),
('imp_dfsk-glory-580','DFSK Glory 580','en'),
('imp_dfsk-glory-580-pro','DFSK Glory 580 Pro','en'),
('imp_domex-domex-fresh-guard-toilet-cleaner','Domex Fresh Guard Toilet Cleaner','en'),
('imp_dove-dove-beauty-bar-original','Dove Beauty Bar Original','en'),
('imp_dove-dove-daily-shine-shampoo','Dove Daily Shine Shampoo','en'),
('imp_dove-dove-hair-fall-rescue-conditioner','Dove Hair Fall Rescue Conditioner','en'),
('imp_dove-dove-hair-fall-rescue-shampoo','Dove Hair Fall Rescue Shampoo','en'),
('imp_dove-dove-intense-repair-conditioner','Dove Intense Repair Conditioner','en'),
('imp_dove-dove-intense-repair-shampoo','Dove Intense Repair Shampoo','en'),
('imp_dunlop-enasave','Dunlop Enasave','en'),
('imp_dunlop-grandtrek','Dunlop Grandtrek','en'),
('imp_dunlop-sp-sport','Dunlop SP Sport','en'),
('imp_ecostar-inverter-ac','EcoStar Inverter AC','en'),
('imp_ecostar-led-tv','EcoStar LED TV','en'),
('imp_ecostar-refrigerator','EcoStar Refrigerator','en'),
('imp_epson-ecotank-printer','Epson EcoTank Printer','en'),
('imp_euro-cake-euro-cake','Euro Cake','en'),
('imp_eva-cooking-oil','Eva Cooking Oil 5L','en'),
('imp_evion-evion-vitamin-e','Evion Vitamin E','en'),
('imp_exide-mf-100','Exide MF 100','en'),
('imp_exide-mf-55l','Exide MF 55L','en'),
('imp_exide-mf-65l','Exide MF 65L','en'),
('imp_exide-mf-75l','Exide MF 75L','en'),
('imp_exide-n-70','Exide N 70','en'),
('imp_faiza-faiza-beauty-cream','Faiza Beauty Cream','en'),
('imp_falcon-super-kernel-basmati-rice','Falcon Super Kernel Basmati Rice 5kg','en'),
('imp_fanta-fanta-orange','Fanta Orange 500ml','en'),
('imp_fauji-corn-flakes','Fauji Corn Flakes','en'),
('imp_faw-v2','FAW V2','en'),
('imp_ferrero-ferrero-rocher','Ferrero Rocher','en'),
('imp_ferrero-nutella-chocolate-hazelnut-spread','Ferrero Nutella Chocolate Hazelnut Spread','en'),
('imp_fiat-480','Fiat 480','en'),
('imp_fiat-640','Fiat 640','en'),
('imp_formula-1-carnauba-wax','Formula 1 Carnauba Wax','en'),
('imp_formula-1-wash-wax','Formula 1 Wash & Wax','en'),
('imp_general-tyre-bg-falcon','General Tyre BG Falcon','en'),
('imp_general-tyre-bg-luxo-plus','General Tyre BG Luxo Plus','en'),
('imp_general-tyre-bg-tempo-plus','General Tyre BG Tempo Plus','en'),
('imp_general-tyre-bg-thunder-max','General Tyre BG Thunder Max','en'),
('imp_general-tyre-bg-traker','General Tyre BG Traker','en'),
('imp_general-tyre-euro-glide','General Tyre Euro Glide','en'),
('imp_general-tyre-euro-kompact','General Tyre Euro Kompact','en')
) AS v(item_id, alias, language)
WHERE NOT EXISTS (SELECT 1 FROM public.item_aliases a WHERE a.item_id = v.item_id AND lower(a.alias) = lower(v.alias));
INSERT INTO public.item_aliases (id, item_id, alias, language)
SELECT gen_random_uuid(), v.item_id, v.alias, v.language
FROM (VALUES
('imp_general-tyre-euro-kruze','General Tyre Euro Kruze','en'),
('imp_general-tyre-euro-star','General Tyre Euro Star','en'),
('imp_general-tyre-euro-tycoon','General Tyre Euro Tycoon','en'),
('imp_general-tyre-xp-2000-ii','General Tyre XP 2000 II','en'),
('imp_generic-extension-board','Generic Extension Board','en'),
('imp_generic-mobile-phone-stand','Generic Mobile Phone Stand','en'),
('imp_generic-otg-adapter-cable','Generic OTG Adapter Cable','en'),
('imp_generic-silicone-back-cover','Generic Silicone Back Cover','en'),
('imp_generic-tempered-glass-screen-protector','Generic Tempered Glass Screen Protector','en'),
('imp_getz-gabica','Getz Gabica','en'),
('imp_getz-montika','Getz Montika','en'),
('imp_getz-onseron','Getz Onseron','en'),
('imp_getz-rigix','Getz Rigix','en'),
('imp_getz-risek','Getz Risek','en'),
('imp_gfc-ceiling-fan','GFC Ceiling Fan','en'),
('imp_gfc-exhaust-fan','GFC Exhaust Fan','en'),
('imp_gfc-inverter-ceiling-fan','GFC Inverter Ceiling Fan','en'),
('imp_gfc-pedestal-fan','GFC Pedestal Fan','en'),
('imp_gillette-gillette-mach3-razor','Gillette Mach3 Razor','en'),
('imp_glow-lovely-glow-lovely-advanced-multivitamin-cr','Glow & Lovely Advanced Multivitamin Cream','en'),
('imp_golden-pearl-golden-pearl-beauty-cream','Golden Pearl Beauty Cream','en'),
('imp_good-milk-pasteurized-milk','Good Milk Pasteurized Milk 1L','en'),
('imp_gourmet-gourmet-cola','Gourmet Cola','en'),
('imp_gourmet-gourmet-water','Gourmet Water 500ml','en'),
('imp_gree-floor-standing-air-conditioner','Gree Floor Standing Air Conditioner','en'),
('imp_gree-lomo-inverter-ac','Gree Lomo Inverter AC','en'),
('imp_gree-split-air-conditioner','Gree Split Air Conditioner','en'),
('imp_gsk-avamys','GSK Avamys','en'),
('imp_gsk-bactroban','GSK Bactroban','en'),
('imp_gsk-beconase','GSK Beconase','en'),
('imp_gsk-becotide','GSK Becotide','en'),
('imp_gsk-betnovate','GSK Betnovate','en'),
('imp_gsk-betnovate-c','GSK Betnovate-C','en'),
('imp_gsk-betnovate-n','GSK Betnovate-N','en'),
('imp_gsk-calpol','GSK Calpol','en'),
('imp_gsk-celin-vitamin-c','GSK Celin Vitamin C','en'),
('imp_gsk-corsodyl','GSK Corsodyl','en'),
('imp_gsk-dermovate','GSK Dermovate','en'),
('imp_gsk-eno','GSK Eno','en'),
('imp_gsk-flixonase','GSK Flixonase','en'),
('imp_gsk-flixotide','GSK Flixotide','en'),
('imp_gsk-glaxose-d','GSK Glaxose-D','en'),
('imp_gsk-imigran','GSK Imigran','en'),
('imp_gsk-panadol','GSK Panadol','en'),
('imp_gsk-panadol-extra','GSK Panadol Extra','en'),
('imp_gsk-polyfax','GSK Polyfax','en'),
('imp_gsk-seretide','GSK Seretide','en'),
('imp_gsk-serevent','GSK Serevent','en'),
('imp_gsk-sinutab','GSK Sinutab','en'),
('imp_gsk-ventolin','GSK Ventolin','en'),
('imp_gsk-zentel','GSK Zentel','en'),
('imp_gsk-zofran','GSK Zofran','en'),
('imp_gsk-zyloric','GSK Zyloric','en'),
('imp_guard-super-kernel-basmati-rice','Guard Super Kernel Basmati Rice 5kg','en'),
('imp_habib-banaspati','Habib Banaspati 5kg','en'),
('imp_habib-cooking-oil','Habib Cooking Oil 5L','en'),
('imp_haier-deep-freezer','Haier Deep Freezer','en'),
('imp_haier-front-load-automatic-washing-machine','Haier Front Load Automatic Washing Machine','en'),
('imp_haier-inverter-air-conditioner','Haier Inverter Air Conditioner','en'),
('imp_haier-inverter-refrigerator','Haier Inverter Refrigerator','en'),
('imp_haier-led-smart-tv','Haier LED Smart TV','en'),
('imp_haier-microwave-oven','Haier Microwave Oven','en'),
('imp_haier-side-by-side-refrigerator','Haier Side-by-Side Refrigerator','en'),
('imp_haier-split-air-conditioner','Haier Split Air Conditioner','en'),
('imp_haier-top-load-automatic-washing-machine','Haier Top Load Automatic Washing Machine','en'),
('imp_haier-twin-tub-washing-machine','Haier Twin Tub Washing Machine','en'),
('imp_haleeb-milk','Haleeb Milk 1L','en'),
('imp_hamdard-joshina','Hamdard Joshina','en'),
('imp_hamdard-rooh-afza','Hamdard Rooh Afza','en'),
('imp_hamdard-sualin','Hamdard Sualin','en'),
('imp_hankook-kinergy','Hankook Kinergy','en'),
('imp_hankook-ventus','Hankook Ventus','en'),
('imp_hansaplast-hansaplast-crepe-bandage','Hansaplast Crepe Bandage','en'),
('imp_hansaplast-hansaplast-wound-plaster','Hansaplast Wound Plaster','en'),
('imp_happy-cow-cheese-slices','Happy Cow Cheese Slices','en'),
('imp_happy-cow-cheese-triangles','Happy Cow Cheese Triangles','en'),
('imp_harpic-harpic-bathroom-cleaner','Harpic Bathroom Cleaner','en'),
('imp_harpic-harpic-power-plus-10x-toilet-cleaner','Harpic Power Plus 10X Toilet Cleaner','en'),
('imp_haval-h6','Haval H6','en'),
('imp_haval-h6-hev','Haval H6 HEV','en'),
('imp_haval-jolion','Haval Jolion','en'),
('imp_haw-par-tiger-balm','Haw Par Tiger Balm','en'),
('imp_head-shoulders-head-shoulders-anti-hairfall-sham','Head & Shoulders Anti-Hairfall Shampoo','en'),
('imp_head-shoulders-head-shoulders-apple-fresh-shampo','Head & Shoulders Apple Fresh Shampoo','en'),
('imp_head-shoulders-head-shoulders-cool-menthol-shamp','Head & Shoulders Cool Menthol Shampoo','en'),
('imp_head-shoulders-head-shoulders-lemon-fresh-shampo','Head & Shoulders Lemon Fresh Shampoo','en'),
('imp_head-shoulders-head-shoulders-smooth-silky-shamp','Head & Shoulders Smooth & Silky Shampoo','en'),
('imp_hemani-hemani-black-seed-oil','Hemani Black Seed Oil','en'),
('imp_hemani-hemani-coconut-oil','Hemani Coconut Oil','en'),
('imp_hemani-hemani-rose-water','Hemani Rose Water','en'),
('imp_hilal-cupkake','Hilal CupKake','en'),
('imp_hilal-ding-dong','Hilal Ding Dong','en'),
('imp_hilal-fresh-up','Hilal Fresh Up','en'),
('imp_hilal-jelly','Hilal Jelly','en'),
('imp_hilton-enzar-hs','Hilton Enzar HS','en'),
('imp_himalaya-himalaya-purifying-neem-face-wash','Himalaya Purifying Neem Face Wash','en'),
('imp_hisense-qled-tv','Hisense QLED TV','en'),
('imp_hisense-smart-tv','Hisense Smart TV','en'),
('imp_honda-accord','Honda Accord','en'),
('imp_honda-br-v','Honda BR-V','en'),
('imp_honda-cb-125f','Honda CB 125F','en'),
('imp_honda-cb-150f','Honda CB 150F','en'),
('imp_honda-cd-100','Honda CD 100','en'),
('imp_honda-cd-70','Honda CD 70','en'),
('imp_honda-cd-70-dream','Honda CD 70 Dream','en'),
('imp_honda-cg-125','Honda CG 125','en'),
('imp_honda-cg-125s','Honda CG 125S','en'),
('imp_honda-city-1-2','Honda City 1.2','en'),
('imp_honda-city-1-3','Honda City 1.3','en'),
('imp_honda-city-1-5','Honda City 1.5','en'),
('imp_honda-city-aspire','Honda City Aspire','en'),
('imp_honda-city-aspire-s','Honda City Aspire S','en'),
('imp_honda-city-vario','Honda City Vario','en'),
('imp_honda-civic-oriel','Honda Civic Oriel','en'),
('imp_honda-civic-rs','Honda Civic RS','en'),
('imp_honda-civic-rs-turbo','Honda Civic RS Turbo','en'),
('imp_honda-civic-vti','Honda Civic VTi','en'),
('imp_honda-cr-v','Honda CR-V','en'),
('imp_honda-fit','Honda Fit','en'),
('imp_honda-hr-v','Honda HR-V','en'),
('imp_honda-pridor','Honda Pridor','en'),
('imp_honda-vezel','Honda Vezel','en'),
('imp_honor-200','Honor 200','en'),
('imp_honor-pad-x9','Honor Pad X9','en'),
('imp_honor-x6b','Honor X6b','en'),
('imp_honor-x7b','Honor X7b','en'),
('imp_honor-x9b','Honor X9b','en'),
('imp_horlicks-horlicks-health-drink','Horlicks Health Drink','en'),
('imp_hp-all-in-one-pc','HP All-in-One PC','en'),
('imp_hp-elitebook','HP EliteBook','en'),
('imp_hp-laserjet-printer','HP LaserJet Printer','en'),
('imp_hp-monitor','HP Monitor','en'),
('imp_hp-pavilion-15','HP Pavilion 15','en'),
('imp_hp-probook','HP ProBook','en'),
('imp_hp-victus','HP Victus','en'),
('imp_hp-wireless-mouse','HP Wireless Mouse','en'),
('imp_hydrozole-hydrozole-cream','Hydrozole Cream','en'),
('imp_hyundai-elantra-gl','Hyundai Elantra GL','en'),
('imp_hyundai-elantra-gls','Hyundai Elantra GLS','en'),
('imp_hyundai-excel','Hyundai Excel','en'),
('imp_hyundai-porter','Hyundai Porter','en'),
('imp_hyundai-santro','Hyundai Santro','en'),
('imp_hyundai-shehzore','Hyundai Shehzore','en'),
('imp_hyundai-sonata','Hyundai Sonata','en'),
('imp_hyundai-tucson-gls','Hyundai Tucson GLS','en'),
('imp_hyundai-tucson-sport','Hyundai Tucson Sport','en'),
('imp_hyundai-tucson-ultimate','Hyundai Tucson Ultimate','en'),
('imp_infinix-gt-20-pro','Infinix GT 20 Pro','en'),
('imp_infinix-hot-30i','Infinix Hot 30i','en'),
('imp_infinix-hot-40','Infinix Hot 40','en'),
('imp_infinix-hot-40-pro','Infinix Hot 40 Pro','en'),
('imp_infinix-hot-40i','Infinix Hot 40i','en'),
('imp_infinix-note-30','Infinix Note 30','en'),
('imp_infinix-note-40','Infinix Note 40','en'),
('imp_infinix-note-40-pro','Infinix Note 40 Pro','en'),
('imp_infinix-smart-8','Infinix Smart 8','en'),
('imp_infinix-zero-30','Infinix Zero 30','en'),
('imp_innovative-chocolate-chip-cookies','Innovative Chocolate Chip Cookies','en'),
('imp_isuzu-d-max','Isuzu D-Max','en'),
('imp_itel-a60','Itel A60','en'),
('imp_itel-a70','Itel A70','en'),
('imp_itel-p55','Itel P55','en'),
('imp_itel-s23','Itel S23','en'),
('imp_itel-s24','Itel S24','en'),
('imp_janssen-imodium','Janssen Imodium','en'),
('imp_janssen-motilium','Janssen Motilium','en'),
('imp_janssen-pariet','Janssen Pariet','en'),
('imp_janssen-sibelium','Janssen Sibelium','en'),
('imp_janssen-vermox','Janssen Vermox','en'),
('imp_jbl-charge-5','JBL Charge 5','en'),
('imp_jbl-flip-6','JBL Flip 6','en'),
('imp_jbl-go-3','JBL Go 3','en'),
('imp_jbl-partybox-110','JBL PartyBox 110','en'),
('imp_jbl-tune-510bt','JBL Tune 510BT','en'),
('imp_jbl-tune-720bt','JBL Tune 720BT','en'),
('imp_jbl-wave-buds','JBL Wave Buds','en'),
('imp_johnson-johnson-microlax','Johnson & Johnson Microlax','en'),
('imp_johnson-s-johnson-s-baby-cream','Johnson''s Baby Cream','en'),
('imp_johnson-s-johnson-s-baby-lotion','Johnson''s Baby Lotion','en'),
('imp_johnson-s-johnson-s-baby-oil','Johnson''s Baby Oil','en'),
('imp_johnson-s-johnson-s-baby-powder','Johnson''s Baby Powder','en'),
('imp_johnson-s-johnson-s-baby-shampoo','Johnson''s Baby Shampoo','en'),
('imp_johnson-s-johnson-s-baby-soap','Johnson''s Baby Soap','en'),
('imp_johnson-s-johnson-s-baby-wipes','Johnson''s Baby Wipes','en'),
('imp_johnson-s-johnson-s-cotton-buds','Johnson''s Cotton Buds','en'),
('imp_jojo-bisko-balls-chocolate-coated-biscuits','Jojo Bisko Balls Chocolate Coated Biscuits','en'),
('imp_k-n-s-chapli-kabab','K&N''s Chapli Kabab','en'),
('imp_k-n-s-chicken-burger-patty','K&N''s Chicken Burger Patty','en'),
('imp_k-n-s-chicken-nuggets','K&N''s Chicken Nuggets','en'),
('imp_k-n-s-chicken-samosa','K&N''s Chicken Samosa','en'),
('imp_k-n-s-chicken-strips','K&N''s Chicken Strips','en'),
('imp_k-n-s-chicken-tempura','K&N''s Chicken Tempura','en'),
('imp_k-n-s-hot-wings','K&N''s Hot Wings','en'),
('imp_k-n-s-kofta','K&N''s Kofta','en'),
('imp_k-n-s-seekh-kabab','K&N''s Seekh Kabab','en'),
('imp_k-n-s-shami-kabab','K&N''s Shami Kabab','en'),
('imp_k-n-s-spring-rolls','K&N''s Spring Rolls','en'),
('imp_k-n-s-tender-pops','K&N''s Tender Pops','en'),
('imp_kashmir-banaspati','Kashmir Banaspati 5kg','en'),
('imp_kashmir-cooking-oil','Kashmir Cooking Oil 5L','en'),
('imp_kellogg-s-chocos','Kellogg''s Chocos','en'),
('imp_kellogg-s-corn-flakes','Kellogg''s Corn Flakes','en'),
('imp_kenacomb-kenacomb-cream','Kenacomb Cream','en'),
('imp_kenwood-e-smart-inverter-ac','Kenwood E-Smart Inverter AC','en'),
('imp_kenwood-food-processor','Kenwood Food Processor','en'),
('imp_kenwood-inverter-refrigerator','Kenwood Inverter Refrigerator','en'),
('imp_kenwood-microwave-oven','Kenwood Microwave Oven','en'),
('imp_kenwood-stand-mixer','Kenwood Stand Mixer','en'),
('imp_kenwood-top-load-automatic-washing-machine','Kenwood Top Load Automatic Washing Machine','en'),
('imp_kia-carnival','Kia Carnival','en'),
('imp_kia-classic','Kia Classic','en'),
('imp_kia-picanto-at','Kia Picanto AT','en'),
('imp_kia-picanto-mt','Kia Picanto MT','en'),
('imp_kia-sorento','Kia Sorento','en'),
('imp_kia-spectra','Kia Spectra','en'),
('imp_kia-sportage-alpha','Kia Sportage Alpha','en'),
('imp_kia-sportage-awd','Kia Sportage AWD','en'),
('imp_kia-sportage-fwd','Kia Sportage FWD','en'),
('imp_kia-stonic-ex','Kia Stonic EX','en'),
('imp_kia-stonic-ex-2','Kia Stonic EX+','en'),
('imp_kinley-kinley','Kinley 500ml','en'),
('imp_kisan-banaspati','Kisan Banaspati 5kg','en'),
('imp_kisan-cooking-oil','Kisan Cooking Oil 5L','en'),
('imp_kixx-g1','Kixx G1','en'),
('imp_knorr-chicken-corn-soup','Knorr Chicken Corn Soup','en'),
('imp_knorr-chicken-noodles','Knorr Chicken Noodles','en'),
('imp_knorr-chicken-stock-cubes','Knorr Chicken Stock Cubes','en'),
('imp_knorr-chicken-tikka-noodles','Knorr Chicken Tikka Noodles','en'),
('imp_knorr-hot-sour-soup','Knorr Hot & Sour Soup','en'),
('imp_knorr-tomato-ketchup','Knorr Tomato Ketchup','en'),
('imp_knorr-tomato-soup','Knorr Tomato Soup','en'),
('imp_knorr-vegetable-soup','Knorr Vegetable Soup','en'),
('imp_kolson-bravo-milk-cookies','Kolson Bravo Milk Cookies','en'),
('imp_kolson-cheese-balls','Kolson Cheese Balls','en'),
('imp_kolson-chunky-chicken','Kolson Chunky Chicken 4 x 65g','en'),
('imp_kolson-elbow-macaroni','Kolson Elbow Macaroni 400g','en'),
('imp_kolson-fold-bbq-snack','Kolson Fold BBQ Snack 21g','en'),
('imp_kolson-jam-hearts-strawberry-vanilla','Kolson Jam Hearts Strawberry & Vanilla','en'),
('imp_kolson-lotte-choco-pie','Kolson Lotte Choco Pie','en'),
('imp_kolson-potato-sticks','Kolson Potato Sticks','en'),
('imp_kolson-slanty-jalapeno','Kolson Slanty Jalapeno 40g','en'),
('imp_kolson-slanty-salted','Kolson Slanty Salted 12 x 13g','en'),
('imp_kolson-slanty-vegetable','Kolson Slanty Vegetable','en'),
('imp_kolson-snackers-french-cheese','Kolson Snackers French Cheese 15g x 10','en'),
('imp_kolson-snackers-hot-masala','Kolson Snackers Hot Masala 15g x 12','en'),
('imp_kolson-spaghetti','Kolson Spaghetti 400g','en'),
('imp_kolson-twich-classic','Kolson Twich Classic','en'),
('imp_korneez-popcorn-bbq','Korneez Popcorn BBQ','en'),
('imp_korneez-popcorn-salted','Korneez Popcorn Salted','en'),
('imp_kurkure-chutney-chaska','Kurkure Chutney Chaska 19g','en'),
('imp_kurkure-red-chilli-jhatka','Kurkure Red Chilli Jhatka','en'),
('imp_kurkure-toofaani-mirch','Kurkure Toofaani Mirch','en'),
('imp_land-rover-range-rover','Land Rover Range Rover','en'),
('imp_land-rover-range-rover-sport','Land Rover Range Rover Sport','en'),
('imp_langnese-honey','Langnese Honey','en'),
('imp_lay-s-masala','Lay''s Masala 29g','en'),
('imp_lay-s-salted','Lay''s Salted','en'),
('imp_lay-s-wavy-bbq','Lay''s Wavy BBQ','en'),
('imp_lay-s-wavy-mexican-chili','Lay''s Wavy Mexican Chili','en'),
('imp_lay-s-yogurt-herb','Lay''s Yogurt & Herb','en'),
('imp_laziza-firni-mix','Laziza Firni Mix','en'),
('imp_laziza-gulab-jamun-mix','Laziza Gulab Jamun Mix','en'),
('imp_laziza-kheer-mix','Laziza Kheer Mix','en'),
('imp_laziza-kulfi-mix','Laziza Kulfi Mix','en'),
('imp_laziza-rasmalai-mix','Laziza Rasmalai Mix','en'),
('imp_laziza-royal-falooda-mix','Laziza Royal Falooda Mix','en'),
('imp_laziza-vanilla-custard-powder','Laziza Vanilla Custard Powder','en'),
('imp_laziza-zarda-mix','Laziza Zarda Mix','en'),
('imp_lemon-max-lemon-max-dishwash-bar','Lemon Max Dishwash Bar 290g','en'),
('imp_lemon-max-lemon-max-dishwash-liquid','Lemon Max Dishwash Liquid','en'),
('imp_lenovo-desktop-pc','Lenovo Desktop PC','en'),
('imp_lenovo-ideapad-slim','Lenovo IdeaPad Slim','en'),
('imp_lenovo-legion','Lenovo Legion','en'),
('imp_lenovo-monitor','Lenovo Monitor','en'),
('imp_lenovo-tab-m10','Lenovo Tab M10','en'),
('imp_lenovo-tab-m11','Lenovo Tab M11','en'),
('imp_lenovo-tab-m9','Lenovo Tab M9','en'),
('imp_lenovo-thinkbook','Lenovo ThinkBook','en'),
('imp_lenovo-thinkpad','Lenovo ThinkPad','en'),
('imp_leo-fucicort','Leo Fucicort','en'),
('imp_leo-fucidin','Leo Fucidin','en'),
('imp_lexus-rx','Lexus RX','en'),
('imp_lg-front-load-automatic-washing-machine','LG Front Load Automatic Washing Machine','en'),
('imp_lg-led-smart-tv','LG LED Smart TV','en'),
('imp_lg-monitor','LG Monitor','en'),
('imp_lg-nanocell-tv','LG NanoCell TV','en'),
('imp_lg-oled-tv','LG OLED TV','en'),
('imp_lg-top-load-automatic-washing-machine','LG Top Load Automatic Washing Machine','en'),
('imp_lifebuoy-lifebuoy-care-handwash','Lifebuoy Care Handwash 200ml','en'),
('imp_lifebuoy-lifebuoy-care-soap','Lifebuoy Care Soap','en'),
('imp_lifebuoy-lifebuoy-lemon-fresh-handwash','Lifebuoy Lemon Fresh Handwash 200ml','en'),
('imp_lifebuoy-lifebuoy-lemon-fresh-soap','Lifebuoy Lemon Fresh Soap','en'),
('imp_lifebuoy-lifebuoy-total-10-handwash','Lifebuoy Total 10 Handwash 200ml','en'),
('imp_lifebuoy-lifebuoy-total-10-soap','Lifebuoy Total 10 Soap','en'),
('imp_lipton-green-tea','Lipton Green Tea','en'),
('imp_lipton-taaza','Lipton Taaza 950g','en'),
('imp_lipton-yellow-label','Lipton Yellow Label 950g','en'),
('imp_lipton-yellow-label-tea','Lipton Yellow Label Tea','en'),
('imp_listerine-listerine-cool-mint-mouthwash','Listerine Cool Mint Mouthwash','en'),
('imp_logitech-wireless-keyboard','Logitech Wireless Keyboard','en'),
('imp_logitech-wireless-mouse','Logitech Wireless Mouse','en'),
('imp_lu-bakeri','LU Bakeri','en'),
('imp_lu-candi','LU Candi','en'),
('imp_lu-gala-egg-biscuits','LU Gala Egg Biscuits','en'),
('imp_lu-prince-chocolate-sandwich-biscuit','LU Prince Chocolate Sandwich Biscuit','en'),
('imp_lu-tiger-glucose-biscuits','LU Tiger Glucose Biscuits','en'),
('imp_lu-tuc','LU TUC','en'),
('imp_lux-lux-dreamy-delight-beauty-soap','Lux Dreamy Delight Beauty Soap','en'),
('imp_lux-lux-soft-touch-beauty-soap','Lux Soft Touch Beauty Soap','en'),
('imp_lux-lux-velvet-touch-beauty-soap','Lux Velvet Touch Beauty Soap','en'),
('imp_maggi-2-minute-masala-noodles','Maggi 2-Minute Masala Noodles','en'),
('imp_marhaba-honey','Marhaba Honey','en'),
('imp_marhaba-isabgol','Marhaba Isabgol','en'),
('imp_mars-snickers','Mars Snickers','en'),
('imp_massey-ferguson-240','Massey Ferguson 240','en'),
('imp_massey-ferguson-260','Massey Ferguson 260','en'),
('imp_massey-ferguson-360','Massey Ferguson 360','en'),
('imp_massey-ferguson-375','Massey Ferguson 375','en'),
('imp_massey-ferguson-385','Massey Ferguson 385','en'),
('imp_massey-ferguson-385-4wd','Massey Ferguson 385 4WD','en'),
('imp_mayfair-cafe-khatai-style-biscuit','Mayfair Cafe Khatai Style Biscuit','en'),
('imp_mayfair-cofied','Mayfair Cofied','en'),
('imp_mayfair-minto','Mayfair Minto','en'),
('imp_medora-medora-lipstick','Medora Lipstick','en'),
('imp_medora-medora-nail-polish','Medora Nail Polish','en'),
('imp_mehran-chapli-kabab','Mehran Chapli Kabab 50g','en'),
('imp_mehran-chicken-biryani','Mehran Chicken Biryani 50g','en'),
('imp_mehran-chicken-chapli-kabab','Mehran Chicken Chapli Kabab 50g','en'),
('imp_mehran-chicken-pulao','Mehran Chicken Pulao 50g','en'),
('imp_mehran-chicken-tikka','Mehran Chicken Tikka 50g','en'),
('imp_mehran-coriander-powder','Mehran Coriander Powder 100g','en'),
('imp_mehran-cumin-powder','Mehran Cumin Powder 100g','en'),
('imp_mehran-garam-masala','Mehran Garam Masala 100g','en'),
('imp_mehran-haleem','Mehran Haleem 50g','en'),
('imp_mehran-karahi-masala','Mehran Karahi Masala 50g','en'),
('imp_mehran-lime-pickle','Mehran Lime Pickle','en'),
('imp_mehran-mango-pickle','Mehran Mango Pickle','en'),
('imp_mehran-mixed-pickle','Mehran Mixed Pickle','en'),
('imp_mehran-nihari','Mehran Nihari 50g','en'),
('imp_mehran-qorma-masala','Mehran Qorma Masala 50g','en'),
('imp_mehran-red-chilli-powder','Mehran Red Chilli Powder 100g','en'),
('imp_mehran-shami-kabab','Mehran Shami Kabab 50g','en'),
('imp_mehran-sindhi-biryani','Mehran Sindhi Biryani 50g','en'),
('imp_mehran-turmeric-powder','Mehran Turmeric Powder 100g','en'),
('imp_mentos-mentos-mint','Mentos Mint','en'),
('imp_mercedes-benz-c-class','Mercedes-Benz C-Class','en'),
('imp_mercedes-benz-e-class','Mercedes-Benz E-Class','en'),
('imp_mercedes-benz-glc','Mercedes-Benz GLC','en'),
('imp_mercedes-benz-s-class','Mercedes-Benz S-Class','en'),
('imp_merck-neurobion','Merck Neurobion','en'),
('imp_merck-neurobion-forte','Merck Neurobion Forte','en'),
('imp_merck-sangobion','Merck Sangobion','en'),
('imp_mezan-banaspati','Mezan Banaspati 5kg','en'),
('imp_mezan-cooking-oil','Mezan Cooking Oil 5L','en'),
('imp_mg-hs','MG HS','en'),
('imp_mg-zs','MG ZS','en'),
('imp_mg-zs-ev','MG ZS EV','en'),
('imp_michelin-energy-xm2','Michelin Energy XM2','en'),
('imp_michelin-pilot-sport','Michelin Pilot Sport','en'),
('imp_michelin-primacy','Michelin Primacy','en'),
('imp_miilee-bhel-puri','Miilee Bhel Puri','en'),
('imp_milkpak-cream','Milkpak Cream','en'),
('imp_milkpak-full-cream-milk','Milkpak Full Cream Milk 1L','en'),
('imp_milo-milo','Milo','en'),
('imp_mirinda-mirinda-orange','Mirinda Orange 500ml','en'),
('imp_mitchell-s-apricot-jam','Mitchell''s Apricot Jam','en'),
('imp_mitchell-s-baked-beans','Mitchell''s Baked Beans','en'),
('imp_mitchell-s-chilli-garlic-sauce','Mitchell''s Chilli Garlic Sauce','en'),
('imp_mitchell-s-fruit-cocktail','Mitchell''s Fruit Cocktail','en'),
('imp_mitchell-s-lemon-squash','Mitchell''s Lemon Squash','en'),
('imp_mitchell-s-mango-squash','Mitchell''s Mango Squash','en'),
('imp_mitchell-s-mixed-fruit-jam','Mitchell''s Mixed Fruit Jam','en'),
('imp_mitchell-s-orange-marmalade','Mitchell''s Orange Marmalade','en'),
('imp_mitchell-s-orange-squash','Mitchell''s Orange Squash','en'),
('imp_mitchell-s-soya-sauce','Mitchell''s Soya Sauce','en'),
('imp_mitchell-s-strawberry-jam','Mitchell''s Strawberry Jam','en'),
('imp_mitchell-s-sweet-corn','Mitchell''s Sweet Corn','en'),
('imp_mitchell-s-tomato-ketchup','Mitchell''s Tomato Ketchup 1kg','en'),
('imp_mitchell-s-tomato-puree','Mitchell''s Tomato Puree','en'),
('imp_mitchell-s-white-vinegar','Mitchell''s White Vinegar','en'),
('imp_mitsubishi-lancer','Mitsubishi Lancer','en'),
('imp_mitsubishi-pajero','Mitsubishi Pajero','en'),
('imp_molfix-molfix-baby-diapers','Molfix Baby Diapers','en'),
('imp_molfix-molfix-baby-pants','Molfix Baby Pants','en'),
('imp_mon-salwa-chicken-chapli-kabab','Mon Salwa Chicken Chapli Kabab','en'),
('imp_mon-salwa-chicken-nuggets','Mon Salwa Chicken Nuggets','en'),
('imp_mon-salwa-chicken-samosa','Mon Salwa Chicken Samosa','en'),
('imp_mon-salwa-chicken-shami-kabab','Mon Salwa Chicken Shami Kabab','en'),
('imp_mon-salwa-plain-paratha','Mon Salwa Plain Paratha','en'),
('imp_mon-salwa-spring-rolls','Mon Salwa Spring Rolls','en'),
('imp_mondelez-halls','Mondelez Halls','en'),
('imp_mortein-mortein-all-insect-killer-spray','Mortein All Insect Killer Spray','en'),
('imp_mortein-mortein-mosquito-repellent-mats','Mortein Mosquito Repellent Mats','en'),
('imp_mortein-mortein-powergard-mosquito-coils','Mortein PowerGard Mosquito Coils','en'),
('imp_mountain-dew-mountain-dew','Mountain Dew 500ml','en'),
('imp_msd-aerius','MSD Aerius','en'),
('imp_msd-arcoxia','MSD Arcoxia','en'),
('imp_msd-nasonex','MSD Nasonex','en'),
('imp_mundipharma-betadine','Mundipharma Betadine','en'),
('imp_murree-sparkletts-bottled-drinking-water','Murree Sparkletts Bottled Drinking Water 330ml','en'),
('imp_national-achar-gosht','National Achar Gosht 50g','en'),
('imp_national-beef-chapli-kabab','National Beef Chapli Kabab 50g','en'),
('imp_national-bombay-biryani','National Bombay Biryani 50g','en'),
('imp_national-butter-chicken','National Butter Chicken 50g','en'),
('imp_national-chana-chaat','National Chana Chaat 50g','en'),
('imp_national-chicken-biryani','National Chicken Biryani 50g','en'),
('imp_national-chicken-chapli-kabab','National Chicken Chapli Kabab 50g','en'),
('imp_national-chicken-chowmein','National Chicken Chowmein 50g','en'),
('imp_national-chicken-handi','National Chicken Handi 50g','en'),
('imp_national-chicken-jalfrezi','National Chicken Jalfrezi 50g','en'),
('imp_national-chicken-karahi','National Chicken Karahi 50g','en'),
('imp_national-chicken-korma','National Chicken Korma 50g','en'),
('imp_national-chicken-manchurian','National Chicken Manchurian 50g','en'),
('imp_national-chicken-pulao','National Chicken Pulao 50g','en'),
('imp_national-chicken-tikka','National Chicken Tikka 50g','en'),
('imp_national-chicken-white-karahi','National Chicken White Karahi 50g','en'),
('imp_national-chilli-garlic-sauce','National Chilli Garlic Sauce','en'),
('imp_national-coriander-powder','National Coriander Powder 100g','en'),
('imp_national-cumin-powder','National Cumin Powder 100g','en'),
('imp_national-dahi-baray','National Dahi Baray 50g','en'),
('imp_national-dry-iron','National Dry Iron','en'),
('imp_national-electric-kettle','National Electric Kettle','en'),
('imp_national-fruit-chaat','National Fruit Chaat 50g','en'),
('imp_national-garam-masala','National Garam Masala 100g','en'),
('imp_national-haleem','National Haleem 50g','en'),
('imp_national-hyderabadi-pickle','National Hyderabadi Pickle','en'),
('imp_national-iodized-salt','National Iodized Salt','en'),
('imp_national-juicer-blender','National Juicer Blender','en'),
('imp_national-karahi-gosht','National Karahi Gosht 50g','en'),
('imp_national-lahori-chargha','National Lahori Chargha 50g','en'),
('imp_national-lahori-fish','National Lahori Fish 50g','en'),
('imp_national-lime-pickle','National Lime Pickle','en'),
('imp_national-malai-boti','National Malai Boti 50g','en'),
('imp_national-mango-pickle','National Mango Pickle','en'),
('imp_national-memoni-biryani','National Memoni Biryani 50g','en'),
('imp_national-mixed-fruit-jam','National Mixed Fruit Jam','en'),
('imp_national-mixed-pickle','National Mixed Pickle','en'),
('imp_national-nihari','National Nihari 50g','en'),
('imp_national-paya','National Paya 50g','en'),
('imp_national-qeema','National Qeema 50g','en'),
('imp_national-red-chilli-powder','National Red Chilli Powder 100g','en'),
('imp_national-sandwich-maker','National Sandwich Maker','en'),
('imp_national-seekh-kabab','National Seekh Kabab 50g','en'),
('imp_national-shami-kabab','National Shami Kabab 50g','en'),
('imp_national-sindhi-biryani','National Sindhi Biryani 50g','en'),
('imp_national-siri-paya','National Siri Paya 50g','en'),
('imp_national-soya-sauce','National Soya Sauce','en'),
('imp_national-strawberry-jam','National Strawberry Jam','en'),
('imp_national-tandoori-masala','National Tandoori Masala 50g','en'),
('imp_national-tomato-ketchup','National Tomato Ketchup','en'),
('imp_national-turmeric-powder','National Turmeric Powder 100g','en'),
('imp_national-vegetable-biryani','National Vegetable Biryani 50g','en'),
('imp_national-white-vinegar','National White Vinegar','en'),
('imp_neosporin-neosporin-ointment','Neosporin Ointment','en'),
('imp_nescafe-3-in-1','Nescafe 3 in 1','en'),
('imp_nescafe-classic','Nescafe Classic 200g','en'),
('imp_nescafe-gold','Nescafe Gold 100g','en'),
('imp_nestl-cerelac-infant-cereal','Nestlé Cerelac Infant Cereal','en'),
('imp_nestl-lactogen-infant-formula','Nestlé Lactogen Infant Formula','en'),
('imp_nestl-milo','Nestlé Milo','en'),
('imp_nestl-nan-infant-formula','Nestlé NAN Infant Formula','en'),
('imp_nestle-cerelac-wheat','Nestle Cerelac Wheat','en'),
('imp_nestle-corn-flakes','Nestle Corn Flakes','en'),
('imp_nestle-everyday','Nestle Everyday','en'),
('imp_nestle-fruita-vitals-apple','Nestle Fruita Vitals Apple','en'),
('imp_nestle-fruita-vitals-mango','Nestle Fruita Vitals Mango','en'),
('imp_nestle-fruita-vitals-orange','Nestle Fruita Vitals Orange','en'),
('imp_nestle-kitkat','Nestle KitKat','en'),
('imp_nestle-koko-krunch','Nestle Koko Krunch','en'),
('imp_nestle-nesfruta','Nestle Nesfruta','en'),
('imp_nestle-nesvita','Nestle Nesvita','en'),
('imp_nestle-nido','Nestle Nido','en'),
('imp_nestle-pure-life','Nestle Pure Life 500ml','en'),
('imp_new-holland-480','New Holland 480','en'),
('imp_new-holland-640','New Holland 640','en'),
('imp_next-cola-next-cola','Next Cola 345ml','en'),
('imp_ngk-iridium-ix','NGK Iridium IX','en'),
('imp_ngk-spark-plug','NGK Spark Plug','en'),
('imp_nimcos-chana-chilli','Nimcos Chana Chilli','en'),
('imp_nimcos-crunchy-mix','Nimcos Crunchy Mix','en'),
('imp_nimcos-dal-moth','Nimcos Dal Moth','en'),
('imp_nimcos-mix-nimco','Nimcos Mix Nimco','en'),
('imp_nimcos-spicy-potato-sticks','Nimcos Spicy Potato Sticks','en'),
('imp_nissan-dayz','Nissan Dayz','en'),
('imp_nissan-sunny','Nissan Sunny','en'),
('imp_nivea-nivea-creme','Nivea Creme','en'),
('imp_nivea-nivea-soft-moisturizing-cream','Nivea Soft Moisturizing Cream','en'),
('imp_nizoral-nizoral-anti-dandruff-shampoo','Nizoral Anti-Dandruff Shampoo','en'),
('imp_nokia-105','Nokia 105','en'),
('imp_nokia-110','Nokia 110','en'),
('imp_nokia-225-4g','Nokia 225 4G','en'),
('imp_nokia-c32','Nokia C32','en'),
('imp_nokia-g42','Nokia G42','en'),
('imp_novartis-cac-1000','Novartis CaC-1000','en'),
('imp_novartis-cac-1000-plus','Novartis CaC-1000 Plus','en'),
('imp_novartis-cataflam','Novartis Cataflam','en'),
('imp_novartis-foradil','Novartis Foradil','en'),
('imp_novartis-lioresal','Novartis Lioresal','en'),
('imp_novartis-migranil','Novartis Migranil','en'),
('imp_novartis-nezeril','Novartis Nezeril','en')
) AS v(item_id, alias, language)
WHERE NOT EXISTS (SELECT 1 FROM public.item_aliases a WHERE a.item_id = v.item_id AND lower(a.alias) = lower(v.alias));
INSERT INTO public.item_aliases (id, item_id, alias, language)
SELECT gen_random_uuid(), v.item_id, v.alias, v.language
FROM (VALUES
('imp_novartis-otrivin','Novartis Otrivin','en'),
('imp_novartis-sinecod','Novartis Sinecod','en'),
('imp_novartis-sirdalud','Novartis Sirdalud','en'),
('imp_novartis-voltaren','Novartis Voltaren','en'),
('imp_novartis-voltaren-emulgel','Novartis Voltaren Emulgel','en'),
('imp_novartis-zaditen','Novartis Zaditen','en'),
('imp_nurpur-butter','Nurpur Butter','en'),
('imp_nurpur-cheese-slices','Nurpur Cheese Slices','en'),
('imp_nurpur-desi-ghee','Nurpur Desi Ghee','en'),
('imp_nurpur-full-cream-milk','Nurpur Full Cream Milk 1L','en'),
('imp_nutella-hazelnut-spread','Nutella Hazelnut Spread','en'),
('imp_olper-s-full-cream-milk','Olper''s Full Cream Milk 1L','en'),
('imp_omron-omron-blood-pressure-monitor','Omron Blood Pressure Monitor','en'),
('imp_omron-omron-digital-thermometer','Omron Digital Thermometer','en'),
('imp_omron-omron-nebulizer','Omron Nebulizer','en'),
('imp_on-call-plus-on-call-plus-glucometer','On Call Plus Glucometer','en'),
('imp_oppo-a18','Oppo A18','en'),
('imp_oppo-a3','Oppo A3','en'),
('imp_oppo-a38','Oppo A38','en'),
('imp_oppo-a58','Oppo A58','en'),
('imp_oppo-a60','Oppo A60','en'),
('imp_oppo-a78','Oppo A78','en'),
('imp_oppo-reno-11','Oppo Reno 11','en'),
('imp_oppo-reno-11f','Oppo Reno 11F','en'),
('imp_oppo-reno-12','Oppo Reno 12','en'),
('imp_oral-b-oral-b-toothbrush','Oral-B Toothbrush','en'),
('imp_oreo-oreo-original','Oreo Original','en'),
('imp_orient-inverter-air-conditioner','Orient Inverter Air Conditioner','en'),
('imp_orient-led-smart-tv','Orient LED Smart TV','en'),
('imp_orient-refrigerator','Orient Refrigerator','en'),
('imp_orient-split-air-conditioner','Orient Split Air Conditioner','en'),
('imp_osaka-mf-70','Osaka MF 70','en'),
('imp_p-g-pepto-bismol','P&G Pepto-Bismol','en'),
('imp_p-g-vicks-vaporub','P&G Vicks Vaporub','en'),
('imp_pak-fan-bracket-fan','Pak Fan Bracket Fan','en'),
('imp_pak-fan-ceiling-fan','Pak Fan Ceiling Fan','en'),
('imp_pak-fan-exhaust-fan','Pak Fan Exhaust Fan','en'),
('imp_pak-fan-inverter-ceiling-fan','Pak Fan Inverter Ceiling Fan','en'),
('imp_pak-fan-pedestal-fan','Pak Fan Pedestal Fan','en'),
('imp_pakola-pakola-ice-cream-soda','Pakola Ice Cream Soda','en'),
('imp_palmolive-palmolive-naturals-soap','Palmolive Naturals Soap','en'),
('imp_pampers-pampers-active-baby-diapers','Pampers Active Baby Diapers','en'),
('imp_pampers-pampers-baby-diapers','Pampers Baby Diapers','en'),
('imp_pampers-pampers-premium-care-diapers','Pampers Premium Care Diapers','en'),
('imp_pantene-pantene-pro-v-hair-fall-control-shampoo','Pantene Pro-V Hair Fall Control Shampoo','en'),
('imp_pantene-pantene-pro-v-silky-smooth-care-shampoo','Pantene Pro-V Silky Smooth Care Shampoo','en'),
('imp_pantene-pantene-pro-v-total-damage-care-shampoo','Pantene Pro-V Total Damage Care Shampoo','en'),
('imp_peek-freans-butter-crunch','Peek Freans Butter Crunch','en'),
('imp_peek-freans-click','Peek Freans Click','en'),
('imp_peek-freans-cocomo','Peek Freans Cocomo','en'),
('imp_peek-freans-farm-house-cookies-butter','Peek Freans Farm House Cookies Butter','en'),
('imp_peek-freans-farm-house-cookies-chocolate-chip','Peek Freans Farm House Cookies Chocolate Chip','en'),
('imp_peek-freans-gluco','Peek Freans Gluco','en'),
('imp_peek-freans-marie','Peek Freans Marie','en'),
('imp_peek-freans-peanut-pik','Peek Freans Peanut Pik','en'),
('imp_peek-freans-rio-chocolate','Peek Freans Rio Chocolate','en'),
('imp_peek-freans-rio-strawberry','Peek Freans Rio Strawberry','en'),
('imp_peek-freans-rio-vanilla','Peek Freans Rio Vanilla','en'),
('imp_peek-freans-saltish','Peek Freans Saltish','en'),
('imp_peek-freans-sooper-chocolate','Peek Freans Sooper Chocolate','en'),
('imp_peek-freans-sooper-elaichi','Peek Freans Sooper Elaichi','en'),
('imp_peek-freans-sooper-original','Peek Freans Sooper Original','en'),
('imp_peek-freans-zeera-plus','Peek Freans Zeera Plus','en'),
('imp_pel-deep-freezer','PEL Deep Freezer','en'),
('imp_pel-inverteron-air-conditioner','PEL InverterOn Air Conditioner','en'),
('imp_pel-inverteron-refrigerator','PEL InverterOn Refrigerator','en'),
('imp_pepsi-pepsi','Pepsi 500ml','en'),
('imp_pepsodent-pepsodent-action-original-toothpaste','Pepsodent Action Original Toothpaste','en'),
('imp_pfizer-atarax','Pfizer Atarax','en'),
('imp_pfizer-celebrex','Pfizer Celebrex','en'),
('imp_pfizer-debridat','Pfizer Debridat','en'),
('imp_pfizer-feldene','Pfizer Feldene','en'),
('imp_pfizer-lyrica','Pfizer Lyrica','en'),
('imp_pfizer-ponstan','Pfizer Ponstan','en'),
('imp_pharmevo-zeet','PharmEvo Zeet','en'),
('imp_philips-airfryer','Philips Airfryer','en'),
('imp_philips-dry-iron','Philips Dry Iron','en'),
('imp_philips-electric-kettle','Philips Electric Kettle','en'),
('imp_philips-hand-blender','Philips Hand Blender','en'),
('imp_philips-juicer','Philips Juicer','en'),
('imp_philips-rice-cooker','Philips Rice Cooker','en'),
('imp_philips-sandwich-maker','Philips Sandwich Maker','en'),
('imp_philips-steam-iron','Philips Steam Iron','en'),
('imp_philips-vacuum-cleaner','Philips Vacuum Cleaner','en'),
('imp_phillips-milk-of-magnesia','Phillips'' Milk of Magnesia','en'),
('imp_pirelli-cinturato','Pirelli Cinturato','en'),
('imp_pirelli-p-zero','Pirelli P Zero','en'),
('imp_pond-s-pond-s-cold-cream','Pond''s Cold Cream','en'),
('imp_pond-s-pond-s-oil-control-face-wash','Pond''s Oil Control Face Wash','en'),
('imp_pond-s-pond-s-pure-white-face-wash','Pond''s Pure White Face Wash','en'),
('imp_pond-s-pond-s-vanishing-cream','Pond''s Vanishing Cream','en'),
('imp_popnosh-caramel-crunch','Popnosh Caramel Crunch','en'),
('imp_popnosh-cheddar-cheese','Popnosh Cheddar Cheese','en'),
('imp_popnosh-choco-loco','Popnosh Choco Loco','en'),
('imp_prema-full-cream-milk','Prema Full Cream Milk 1L','en'),
('imp_prince-pearl','Prince Pearl','en'),
('imp_proton-saga','Proton Saga','en'),
('imp_proton-x70','Proton X70','en'),
('imp_pso-carient-plus','PSO Carient Plus','en'),
('imp_pso-carient-synthetic','PSO Carient Synthetic','en'),
('imp_pso-carient-ultra','PSO Carient Ultra','en'),
('imp_pso-deo-max','PSO DEO Max','en'),
('imp_pyodine-pyodine-antiseptic-solution','Pyodine Antiseptic Solution','en'),
('imp_qarshi-jam-e-shirin','Qarshi Jam-e-Shirin','en'),
('imp_qcy-t13','QCY T13','en'),
('imp_qcy-t13-earbuds','QCY T13 Earbuds','en'),
('imp_qingqi-auto-rickshaw','Qingqi Auto Rickshaw','en'),
('imp_quaker-oats','Quaker Oats','en'),
('imp_rafhan-corn-flour','Rafhan Corn Flour','en'),
('imp_rafhan-mango-custard-powder','Rafhan Mango Custard Powder','en'),
('imp_rafhan-orange-jelly-crystals','Rafhan Orange Jelly Crystals','en'),
('imp_rafhan-pineapple-jelly-crystals','Rafhan Pineapple Jelly Crystals','en'),
('imp_rafhan-strawberry-custard-powder','Rafhan Strawberry Custard Powder','en'),
('imp_rafhan-strawberry-jelly-crystals','Rafhan Strawberry Jelly Crystals','en'),
('imp_rafhan-vanilla-custard-powder','Rafhan Vanilla Custard Powder','en'),
('imp_realme-11','Realme 11','en'),
('imp_realme-12','Realme 12','en'),
('imp_realme-c51','Realme C51','en'),
('imp_realme-c53','Realme C53','en'),
('imp_realme-c55','Realme C55','en'),
('imp_realme-c61','Realme C61','en'),
('imp_realme-c63','Realme C63','en'),
('imp_realme-c65','Realme C65','en'),
('imp_realme-c67','Realme C67','en'),
('imp_realme-note-50','Realme Note 50','en'),
('imp_reckitt-dettol-antiseptic-liquid','Reckitt Dettol Antiseptic Liquid','en'),
('imp_reckitt-dettol-soap','Reckitt Dettol Soap','en'),
('imp_reckitt-disprin','Reckitt Disprin','en'),
('imp_reckitt-gaviscon','Reckitt Gaviscon','en'),
('imp_reckitt-strepsils','Reckitt Strepsils','en'),
('imp_red-bull-red-bull','Red Bull 250ml','en'),
('imp_rin-rin-detergent-bar','Rin Detergent Bar','en'),
('imp_road-prince-125','Road Prince 125','en'),
('imp_road-prince-70','Road Prince 70','en'),
('imp_roche-accu-chek-glucometer','Roche Accu-Chek Glucometer','en'),
('imp_roche-accu-chek-test-strips','Roche Accu-Chek Test Strips','en'),
('imp_roche-kytril','Roche Kytril','en'),
('imp_roche-tamiflu','Roche Tamiflu','en'),
('imp_ronin-car-charger','Ronin Car Charger','en'),
('imp_ronin-fast-charger','Ronin Fast Charger','en'),
('imp_ronin-power-bank','Ronin Power Bank','en'),
('imp_ronin-tws-earbuds','Ronin TWS Earbuds','en'),
('imp_ronin-usb-cable','Ronin USB Cable','en'),
('imp_ronin-wired-handsfree','Ronin Wired Handsfree','en'),
('imp_rose-petal-rose-petal-facial-tissues','Rose Petal Facial Tissues','en'),
('imp_rose-petal-rose-petal-kitchen-towel','Rose Petal Kitchen Towel','en'),
('imp_rose-petal-rose-petal-toilet-rolls','Rose Petal Toilet Rolls','en'),
('imp_rossmax-rossmax-blood-pressure-monitor','Rossmax Blood Pressure Monitor','en'),
('imp_rottapharm-viartril','Rottapharm Viartril','en'),
('imp_royal-bracket-fan','Royal Bracket Fan','en'),
('imp_royal-ceiling-fan','Royal Ceiling Fan','en'),
('imp_royal-inverter-ceiling-fan','Royal Inverter Ceiling Fan','en'),
('imp_royal-pedestal-fan','Royal Pedestal Fan','en'),
('imp_sabroso-chicken-nuggets','Sabroso Chicken Nuggets','en'),
('imp_sabroso-chicken-seekh-kabab','Sabroso Chicken Seekh Kabab','en'),
('imp_sabroso-chicken-strips','Sabroso Chicken Strips','en'),
('imp_saeed-ghani-saeed-ghani-ubtan-powder','Saeed Ghani Ubtan Powder','en'),
('imp_safeguard-safeguard-lemon-fresh-soap','Safeguard Lemon Fresh Soap','en'),
('imp_safeguard-safeguard-liquid-handwash','Safeguard Liquid Handwash 200ml','en'),
('imp_safeguard-safeguard-pure-white-soap','Safeguard Pure White Soap','en'),
('imp_sami-dicloran','Sami Dicloran','en'),
('imp_sami-navidoxine','Sami Navidoxine','en'),
('imp_sami-skilax','Sami Skilax','en'),
('imp_sami-tres-orix','Sami Tres-Orix','en'),
('imp_sami-ulsanic','Sami Ulsanic','en'),
('imp_samsung-25w-usb-c-charger','Samsung 25W USB-C Charger','en'),
('imp_samsung-crystal-4k-uhd-tv','Samsung Crystal 4K UHD TV','en'),
('imp_samsung-galaxy-a05','Samsung Galaxy A05','en'),
('imp_samsung-galaxy-a05s','Samsung Galaxy A05s','en'),
('imp_samsung-galaxy-a06','Samsung Galaxy A06','en'),
('imp_samsung-galaxy-a15','Samsung Galaxy A15','en'),
('imp_samsung-galaxy-a16','Samsung Galaxy A16','en'),
('imp_samsung-galaxy-a25','Samsung Galaxy A25','en'),
('imp_samsung-galaxy-a34','Samsung Galaxy A34','en'),
('imp_samsung-galaxy-a35','Samsung Galaxy A35','en'),
('imp_samsung-galaxy-a36','Samsung Galaxy A36','en'),
('imp_samsung-galaxy-a55','Samsung Galaxy A55','en'),
('imp_samsung-galaxy-buds-2','Samsung Galaxy Buds 2','en'),
('imp_samsung-galaxy-s23','Samsung Galaxy S23','en'),
('imp_samsung-galaxy-s23-fe','Samsung Galaxy S23 FE','en'),
('imp_samsung-galaxy-s23-ultra','Samsung Galaxy S23 Ultra','en'),
('imp_samsung-galaxy-s24','Samsung Galaxy S24','en'),
('imp_samsung-galaxy-s24-fe','Samsung Galaxy S24 FE','en'),
('imp_samsung-galaxy-s25','Samsung Galaxy S25','en'),
('imp_samsung-galaxy-tab-a9','Samsung Galaxy Tab A9','en'),
('imp_samsung-galaxy-tab-a9-2','Samsung Galaxy Tab A9+','en'),
('imp_samsung-galaxy-tab-s6-lite','Samsung Galaxy Tab S6 Lite','en'),
('imp_samsung-galaxy-tab-s9-fe','Samsung Galaxy Tab S9 FE','en'),
('imp_samsung-galaxy-watch-6','Samsung Galaxy Watch 6','en'),
('imp_samsung-galaxy-z-flip-5','Samsung Galaxy Z Flip 5','en'),
('imp_samsung-galaxy-z-flip-6','Samsung Galaxy Z Flip 6','en'),
('imp_samsung-galaxy-z-fold-5','Samsung Galaxy Z Fold 5','en'),
('imp_samsung-galaxy-z-fold-6','Samsung Galaxy Z Fold 6','en'),
('imp_samsung-monitor','Samsung Monitor','en'),
('imp_samsung-qled-4k-tv','Samsung QLED 4K TV','en'),
('imp_samsung-top-load-automatic-washing-machine','Samsung Top Load Automatic Washing Machine','en'),
('imp_sandisk-memory-card','SanDisk Memory Card','en'),
('imp_sandisk-usb-flash-drive','SanDisk USB Flash Drive','en'),
('imp_sanofi-avil','Sanofi Avil','en'),
('imp_sanofi-bisolvon','Sanofi Bisolvon','en'),
('imp_sanofi-buscopan','Sanofi Buscopan','en'),
('imp_sanofi-essentiale','Sanofi Essentiale','en'),
('imp_sanofi-flagyl','Sanofi Flagyl','en'),
('imp_sanofi-guttalax','Sanofi Guttalax','en'),
('imp_sanofi-mucosolvan','Sanofi Mucosolvan','en'),
('imp_sanofi-muscoril','Sanofi Muscoril','en'),
('imp_sanofi-nasacort','Sanofi Nasacort','en'),
('imp_sanofi-no-spa','Sanofi No-Spa','en'),
('imp_sanofi-novalgin','Sanofi Novalgin','en'),
('imp_sanofi-phenergan','Sanofi Phenergan','en'),
('imp_sanofi-proctosedyl','Sanofi Proctosedyl','en'),
('imp_sanofi-telfast','Sanofi Telfast','en'),
('imp_sanofi-vaxigrip','Sanofi Vaxigrip','en'),
('imp_sazgar-auto-rickshaw','Sazgar Auto Rickshaw','en'),
('imp_scabion-scabion-lotion','Scabion Lotion','en'),
('imp_searle-anafortan','Searle Anafortan','en'),
('imp_searle-gravinate','Searle Gravinate','en'),
('imp_searle-hydryllin','Searle Hydryllin','en'),
('imp_searle-hydryllin-dm','Searle Hydryllin DM','en'),
('imp_searle-nuberol','Searle Nuberol','en'),
('imp_searle-nuberol-forte','Searle Nuberol Forte','en'),
('imp_seasons-canola-oil','Seasons Canola Oil 5L','en'),
('imp_sensodyne-sensodyne-rapid-relief-toothpaste','Sensodyne Rapid Relief Toothpaste','en'),
('imp_sensodyne-sensodyne-repair-protect-toothpaste','Sensodyne Repair & Protect Toothpaste','en'),
('imp_servis-cheetah','Servis Cheetah','en'),
('imp_servis-longlife','Servis Longlife','en'),
('imp_seven-seas-seven-seas-cod-liver-oil','Seven Seas Cod Liver Oil','en'),
('imp_shahi-ballay-ballay-dal-chaska','Shahi Ballay Ballay Dal Chaska','en'),
('imp_shan-achar-gosht','Shan Achar Gosht 50g','en'),
('imp_shan-beef-chapli-kabab','Shan Beef Chapli Kabab 50g','en'),
('imp_shan-bihari-kabab','Shan Bihari Kabab 50g','en'),
('imp_shan-bombay-biryani','Shan Bombay Biryani 50g','en'),
('imp_shan-butter-chicken','Shan Butter Chicken 50g','en'),
('imp_shan-chana-chaat','Shan Chana Chaat 50g','en'),
('imp_shan-chana-masala','Shan Chana Masala 50g','en'),
('imp_shan-chicken-biryani','Shan Chicken Biryani 50g','en'),
('imp_shan-chicken-chapli-kabab','Shan Chicken Chapli Kabab 50g','en'),
('imp_shan-chicken-chowmein','Shan Chicken Chowmein 50g','en'),
('imp_shan-chicken-handi','Shan Chicken Handi 50g','en'),
('imp_shan-chicken-jalfrezi','Shan Chicken Jalfrezi 50g','en'),
('imp_shan-chicken-karahi','Shan Chicken Karahi 50g','en'),
('imp_shan-chicken-korma','Shan Chicken Korma 50g','en'),
('imp_shan-chicken-manchurian','Shan Chicken Manchurian 50g','en'),
('imp_shan-chicken-pulao','Shan Chicken Pulao 50g','en'),
('imp_shan-chicken-tikka','Shan Chicken Tikka 50g','en'),
('imp_shan-chicken-white-karahi','Shan Chicken White Karahi 50g','en'),
('imp_shan-coriander-powder','Shan Coriander Powder 100g','en'),
('imp_shan-cumin-powder','Shan Cumin Powder 100g','en'),
('imp_shan-dahi-baray','Shan Dahi Baray 50g','en'),
('imp_shan-dal-fry','Shan Dal Fry 50g','en'),
('imp_shan-dal-gosht','Shan Dal Gosht 50g','en'),
('imp_shan-fruit-chaat','Shan Fruit Chaat 50g','en'),
('imp_shan-garam-masala','Shan Garam Masala 100g','en'),
('imp_shan-gola-kabab','Shan Gola Kabab 50g','en'),
('imp_shan-haleem','Shan Haleem 50g','en'),
('imp_shan-hyderabadi-pickle','Shan Hyderabadi Pickle','en'),
('imp_shan-kabuli-pulao','Shan Kabuli Pulao 50g','en'),
('imp_shan-karachi-beef-biryani','Shan Karachi Beef Biryani 50g','en'),
('imp_shan-lahori-chargha','Shan Lahori Chargha 50g','en'),
('imp_shan-lahori-fish','Shan Lahori Fish 50g','en'),
('imp_shan-lime-pickle','Shan Lime Pickle','en'),
('imp_shan-malai-boti','Shan Malai Boti 50g','en'),
('imp_shan-mango-pickle','Shan Mango Pickle','en'),
('imp_shan-memoni-biryani','Shan Memoni Biryani 50g','en'),
('imp_shan-mixed-pickle','Shan Mixed Pickle','en'),
('imp_shan-mutton-karahi','Shan Mutton Karahi 50g','en'),
('imp_shan-nihari','Shan Nihari 50g','en'),
('imp_shan-pakora-mix','Shan Pakora Mix 50g','en'),
('imp_shan-pani-puri','Shan Pani Puri 50g','en'),
('imp_shan-paya','Shan Paya 50g','en'),
('imp_shan-qeema','Shan Qeema 50g','en'),
('imp_shan-red-chilli-powder','Shan Red Chilli Powder 100g','en'),
('imp_shan-samosa','Shan Samosa 50g','en'),
('imp_shan-seekh-kabab','Shan Seekh Kabab 50g','en'),
('imp_shan-shami-kabab','Shan Shami Kabab 50g','en'),
('imp_shan-sindhi-biryani','Shan Sindhi Biryani 50g','en'),
('imp_shan-siri-paya','Shan Siri Paya 50g','en'),
('imp_shan-tandoori-masala','Shan Tandoori Masala 50g','en'),
('imp_shan-turmeric-powder','Shan Turmeric Powder 100g','en'),
('imp_shan-vegetable-biryani','Shan Vegetable Biryani 50g','en'),
('imp_shan-yakhni-pulao','Shan Yakhni Pulao 50g','en'),
('imp_shangrila-bbq-sauce','Shangrila BBQ Sauce','en'),
('imp_shangrila-chilli-garlic-sauce','Shangrila Chilli Garlic Sauce','en'),
('imp_shangrila-soya-sauce','Shangrila Soya Sauce','en'),
('imp_shangrila-tomato-ketchup','Shangrila Tomato Ketchup','en'),
('imp_shangrila-white-vinegar','Shangrila White Vinegar','en'),
('imp_shell-advance-ax5','Shell Advance AX5','en'),
('imp_shell-helix-hx3','Shell Helix HX3','en'),
('imp_shell-helix-hx5','Shell Helix HX5','en'),
('imp_shell-helix-hx6','Shell Helix HX6','en'),
('imp_shell-helix-hx7','Shell Helix HX7','en'),
('imp_shell-helix-ultra','Shell Helix Ultra','en'),
('imp_shell-rimula-r4','Shell Rimula R4','en'),
('imp_shezan-lychee-juice','Shezan Lychee Juice','en'),
('imp_shezan-mango-juice','Shezan Mango Juice','en'),
('imp_singer-sewing-machine','Singer Sewing Machine','en'),
('imp_slice-slice-mango','Slice Mango','en'),
('imp_smile-apple-juice','Smile Apple Juice','en'),
('imp_snack-city-kurleez-mirch-masala','Snack City Kurleez Mirch Masala','en'),
('imp_snakitos-chickpea-masala','Snakitos Chickpea Masala','en'),
('imp_snakitos-patata-masala','Snakitos Patata Masala','en'),
('imp_snakitos-patata-salty','Snakitos Patata Salty','en'),
('imp_sonax-car-shampoo','Sonax Car Shampoo','en'),
('imp_soya-supreme-banaspati','Soya Supreme Banaspati 5kg','en'),
('imp_soya-supreme-cooking-oil','Soya Supreme Cooking Oil 5L','en'),
('imp_sprite-sprite','Sprite 500ml','en'),
('imp_stillman-s-stillman-s-skin-bleach-cream','Stillman''s Skin Bleach Cream 28g','en'),
('imp_sting-sting','Sting','en'),
('imp_stp-octane-booster','STP Octane Booster','en'),
('imp_sudocrem-sudocrem-antiseptic-healing-cream','Sudocrem Antiseptic Healing Cream','en'),
('imp_sufi-banaspati','Sufi Banaspati 5kg','en'),
('imp_sufi-cooking-oil','Sufi Cooking Oil 5L','en'),
('imp_sufi-sufi-soap','Sufi Soap','en'),
('imp_sunridge-chakki-atta','Sunridge Chakki Atta 20kg','en'),
('imp_sunridge-maida','Sunridge Maida 1kg','en'),
('imp_sunridge-suji','Sunridge Suji 1kg','en'),
('imp_sunsilk-sunsilk-anti-dandruff-shampoo','Sunsilk Anti-Dandruff Shampoo','en'),
('imp_sunsilk-sunsilk-black-shine-shampoo','Sunsilk Black Shine Shampoo','en'),
('imp_sunsilk-sunsilk-long-healthy-growth-shampoo','Sunsilk Long & Healthy Growth Shampoo','en'),
('imp_sunsilk-sunsilk-perfect-straight-shampoo','Sunsilk Perfect Straight Shampoo','en'),
('imp_sunsilk-sunsilk-thick-long-shampoo','Sunsilk Thick & Long Shampoo','en'),
('imp_super-asia-ceiling-fan','Super Asia Ceiling Fan','en'),
('imp_super-asia-cooking-range','Super Asia Cooking Range','en'),
('imp_super-asia-pedestal-fan','Super Asia Pedestal Fan','en'),
('imp_super-asia-room-cooler','Super Asia Room Cooler','en'),
('imp_super-asia-twin-tub-washing-machine','Super Asia Twin Tub Washing Machine','en'),
('imp_super-asia-water-dispenser','Super Asia Water Dispenser','en'),
('imp_super-crisp-catty-chins-cheese','Super Crisp Catty Chins Cheese 27g x 6','en'),
('imp_super-crisp-dino-munchies-ketchup','Super Crisp Dino Munchies Ketchup','en'),
('imp_super-crisp-natural-potato-chips-bar-b-q','Super Crisp Natural Potato Chips Bar.B.Q 120g','en'),
('imp_super-crisp-natural-potato-chips-masala','Super Crisp Natural Potato Chips Masala','en'),
('imp_super-crisp-natural-potato-chips-salted','Super Crisp Natural Potato Chips Salted','en'),
('imp_super-crisp-nimko-mix-nuts','Super Crisp Nimko Mix & Nuts','en'),
('imp_super-crisp-twister-ketchup','Super Crisp Twister Ketchup','en'),
('imp_super-power-125','Super Power 125','en'),
('imp_super-power-70','Super Power 70','en'),
('imp_supreme-supreme-tea','Supreme Tea','en'),
('imp_surf-excel-surf-excel-easy-wash-detergent-powder','Surf Excel Easy Wash Detergent Powder 1kg','en'),
('imp_surf-excel-surf-excel-matic-front-load-detergent','Surf Excel Matic Front Load Detergent 1kg','en'),
('imp_surf-excel-surf-excel-matic-top-load-detergent','Surf Excel Matic Top Load Detergent 1kg','en'),
('imp_suzuki-alto-vx','Suzuki Alto VX','en'),
('imp_suzuki-alto-vxl','Suzuki Alto VXL','en'),
('imp_suzuki-alto-vxl-ags','Suzuki Alto VXL AGS','en'),
('imp_suzuki-alto-vxr','Suzuki Alto VXR','en'),
('imp_suzuki-apv','Suzuki APV','en'),
('imp_suzuki-baleno','Suzuki Baleno','en'),
('imp_suzuki-bolan','Suzuki Bolan','en'),
('imp_suzuki-cultus-vxl','Suzuki Cultus VXL','en'),
('imp_suzuki-cultus-vxl-ags','Suzuki Cultus VXL AGS','en'),
('imp_suzuki-cultus-vxr','Suzuki Cultus VXR','en'),
('imp_suzuki-every-vx','Suzuki Every VX','en'),
('imp_suzuki-every-vxr','Suzuki Every VXR','en'),
('imp_suzuki-fx','Suzuki FX','en'),
('imp_suzuki-gd-110s','Suzuki GD 110S','en'),
('imp_suzuki-gr-150','Suzuki GR 150','en'),
('imp_suzuki-gs-150','Suzuki GS 150','en'),
('imp_suzuki-gs-150-se','Suzuki GS 150 SE','en'),
('imp_suzuki-jimny','Suzuki Jimny','en'),
('imp_suzuki-khyber','Suzuki Khyber','en'),
('imp_suzuki-liana','Suzuki Liana','en'),
('imp_suzuki-margalla','Suzuki Margalla','en'),
('imp_suzuki-mehran-vx','Suzuki Mehran VX','en'),
('imp_suzuki-mehran-vxr','Suzuki Mehran VXR','en'),
('imp_suzuki-potohar','Suzuki Potohar','en'),
('imp_suzuki-ravi','Suzuki Ravi','en'),
('imp_suzuki-swift-dlx','Suzuki Swift DLX','en'),
('imp_suzuki-swift-dx','Suzuki Swift DX','en'),
('imp_suzuki-swift-gl','Suzuki Swift GL','en'),
('imp_suzuki-swift-gl-cvt','Suzuki Swift GL CVT','en'),
('imp_suzuki-swift-glx','Suzuki Swift GLX','en'),
('imp_suzuki-wagon-r-vxl','Suzuki Wagon R VXL','en'),
('imp_suzuki-wagon-r-vxl-ags','Suzuki Wagon R VXL AGS','en'),
('imp_suzuki-wagon-r-vxr','Suzuki Wagon R VXR','en'),
('imp_takeda-pantoloc','Takeda Pantoloc','en'),
('imp_tang-tang-mango','Tang Mango','en'),
('imp_tang-tang-orange','Tang Orange','en'),
('imp_tapal-chenak','Tapal Chenak','en'),
('imp_tapal-danedar','Tapal Danedar 950g','en'),
('imp_tapal-family-mixture','Tapal Family Mixture 950g','en'),
('imp_tapal-gulbahar','Tapal Gulbahar','en'),
('imp_tapal-mezban','Tapal Mezban 950g','en'),
('imp_tapal-tez-dam','Tapal Tez Dam','en'),
('imp_tapal-tezdum','Tapal Tezdum 950g','en'),
('imp_tarang-tea-whitener','Tarang Tea Whitener','en'),
('imp_tcl-android-smart-tv','TCL Android Smart TV','en'),
('imp_tcl-google-tv','TCL Google TV','en'),
('imp_tcl-inverter-air-conditioner','TCL Inverter Air Conditioner','en'),
('imp_tcl-qled-4k-tv','TCL QLED 4K TV','en'),
('imp_tecno-camon-20','Tecno Camon 20','en'),
('imp_tecno-camon-20-pro','Tecno Camon 20 Pro','en'),
('imp_tecno-camon-30','Tecno Camon 30','en'),
('imp_tecno-phantom-v-flip','Tecno Phantom V Flip','en'),
('imp_tecno-pop-7','Tecno Pop 7','en'),
('imp_tecno-pop-8','Tecno Pop 8','en'),
('imp_tecno-spark-10c','Tecno Spark 10C','en'),
('imp_tecno-spark-20','Tecno Spark 20','en'),
('imp_tecno-spark-20c','Tecno Spark 20C','en'),
('imp_tecno-spark-go-2024','Tecno Spark Go 2024','en'),
('imp_tibet-tibet-cold-cream','Tibet Cold Cream','en'),
('imp_tibet-tibet-cream','Tibet Cream','en'),
('imp_tibet-tibet-soap','Tibet Soap','en'),
('imp_tibet-tibet-talcum-powder','Tibet Talcum Powder','en'),
('imp_toblerone-toblerone','Toblerone','en'),
('imp_top-pops-chicken','Top Pops Chicken','en'),
('imp_top-pops-spicy','Top Pops Spicy','en'),
('imp_total-quartz-5000','Total Quartz 5000','en'),
('imp_total-quartz-7000','Total Quartz 7000','en'),
('imp_total-quartz-9000','Total Quartz 9000','en'),
('imp_total-rubia','Total Rubia','en'),
('imp_toyota-aqua','Toyota Aqua','en'),
('imp_toyota-camry','Toyota Camry','en'),
('imp_toyota-corolla-2-0d','Toyota Corolla 2.0D','en'),
('imp_toyota-corolla-altis','Toyota Corolla Altis','en'),
('imp_toyota-corolla-altis-grande','Toyota Corolla Altis Grande','en'),
('imp_toyota-corolla-altis-x','Toyota Corolla Altis X','en'),
('imp_toyota-corolla-cross','Toyota Corolla Cross','en'),
('imp_toyota-corolla-gli','Toyota Corolla GLi','en'),
('imp_toyota-corolla-xli','Toyota Corolla XLi','en'),
('imp_toyota-fortuner-2-7-g','Toyota Fortuner 2.7 G','en'),
('imp_toyota-fortuner-2-8-sigma-4','Toyota Fortuner 2.8 Sigma 4','en'),
('imp_toyota-hilux-double-cab-e','Toyota Hilux Double Cab E','en'),
('imp_toyota-hilux-double-cab-g','Toyota Hilux Double Cab G','en'),
('imp_toyota-hilux-revo','Toyota Hilux Revo','en'),
('imp_toyota-hilux-revo-gr-s','Toyota Hilux Revo GR-S','en'),
('imp_toyota-hilux-single-cab','Toyota Hilux Single Cab','en'),
('imp_toyota-hilux-surf','Toyota Hilux Surf','en'),
('imp_toyota-hilux-vigo','Toyota Hilux Vigo','en'),
('imp_toyota-land-cruiser','Toyota Land Cruiser','en'),
('imp_toyota-land-cruiser-prado','Toyota Land Cruiser Prado','en'),
('imp_toyota-passo','Toyota Passo','en'),
('imp_toyota-prius','Toyota Prius','en'),
('imp_toyota-vitz','Toyota Vitz','en'),
('imp_toyota-yaris-ativ','Toyota Yaris Ativ','en'),
('imp_toyota-yaris-ativ-cvt','Toyota Yaris Ativ CVT','en'),
('imp_toyota-yaris-ativ-x','Toyota Yaris Ativ X','en'),
('imp_toyota-yaris-gli','Toyota Yaris GLi','en'),
('imp_toyota-yaris-gli-cvt','Toyota Yaris GLi CVT','en'),
('imp_tresemm-tresemm-biotin-repair-shampoo','TRESemmé Biotin Repair Shampoo 170ml','en'),
('imp_tresemm-tresemm-bondplex-sleek-and-repair-shampo','TRESemmé Bondplex Sleek And Repair Shampoo 170ml','en'),
('imp_tresemm-tresemm-botanique-nourish-and-replenish-','TRESemmé Botanique Nourish And Replenish Shampoo 170ml','en'),
('imp_tresemm-tresemm-colour-revitalise-conditioner','TRESemmé Colour Revitalise Conditioner 160ml','en'),
('imp_tresemm-tresemm-colour-revitalise-shampoo','TRESemmé Colour Revitalise Shampoo 170ml','en'),
('imp_tresemm-tresemm-keratin-smooth-hair-mask','TRESemmé Keratin Smooth Hair Mask 250ml','en'),
('imp_tresemm-tresemm-keratin-smooth-serum','TRESemmé Keratin Smooth Serum 100ml','en'),
('imp_tresemm-tresemm-keratin-smooth-straight-conditio','TRESemmé Keratin Smooth & Straight Conditioner 160ml','en'),
('imp_tresemm-tresemm-keratin-smooth-straight-shampoo','TRESemmé Keratin Smooth & Straight Shampoo 170ml','en'),
('imp_tresemm-tresemm-rich-moisture-shampoo','TRESemmé Rich Moisture Shampoo 170ml','en'),
('imp_tropicana-tropicana-orange','Tropicana Orange','en'),
('imp_tullo-banaspati','Tullo Banaspati 5kg','en'),
('imp_tullo-cooking-oil','Tullo Cooking Oil 5L','en'),
('imp_united-alpha','United Alpha','en'),
('imp_united-bravo','United Bravo','en'),
('imp_united-us-125','United US 125','en'),
('imp_united-us-70','United US 70','en'),
('imp_vaseline-vaseline-intensive-care-deep-restore-lo','Vaseline Intensive Care Deep Restore Lotion','en'),
('imp_vaseline-vaseline-original-petroleum-jelly','Vaseline Original Petroleum Jelly','en'),
('imp_veet-veet-hair-removal-cream-normal-skin','Veet Hair Removal Cream Normal Skin','en'),
('imp_veet-veet-hair-removal-cream-sensitive-skin','Veet Hair Removal Cream Sensitive Skin','en'),
('imp_vim-vim-dishwash-bar','Vim Dishwash Bar','en'),
('imp_vim-vim-dishwash-liquid-lemon','Vim Dishwash Liquid Lemon','en'),
('imp_vital-vital-tea','Vital Tea 950g','en'),
('imp_vivo-v29','Vivo V29','en'),
('imp_vivo-v29e','Vivo V29e','en'),
('imp_vivo-v30','Vivo V30','en'),
('imp_vivo-v30e','Vivo V30e','en'),
('imp_vivo-v40','Vivo V40','en'),
('imp_vivo-y100','Vivo Y100','en'),
('imp_vivo-y17s','Vivo Y17s','en'),
('imp_vivo-y28','Vivo Y28','en'),
('imp_vivo-y36','Vivo Y36','en'),
('imp_waves-deep-freezer','Waves Deep Freezer','en'),
('imp_waves-refrigerator','Waves Refrigerator','en'),
('imp_waves-twin-tub-washing-machine','Waves Twin Tub Washing Machine','en'),
('imp_wd-40-multi-use-product','WD-40 Multi-Use Product','en'),
('imp_weetabix-weetabix-original','Weetabix Original','en'),
('imp_westpoint-dry-iron','Westpoint Dry Iron','en'),
('imp_westpoint-electric-kettle','Westpoint Electric Kettle','en'),
('imp_westpoint-food-chopper','Westpoint Food Chopper','en'),
('imp_westpoint-juicer-blender','Westpoint Juicer Blender','en'),
('imp_westpoint-microwave-oven','Westpoint Microwave Oven','en'),
('imp_westpoint-room-heater','Westpoint Room Heater','en'),
('imp_westpoint-sandwich-maker','Westpoint Sandwich Maker','en'),
('imp_westpoint-toaster','Westpoint Toaster','en'),
('imp_woodward-s-woodward-s-gripe-water','Woodward''s Gripe Water','en'),
('imp_wrigley-doublemint','Wrigley Doublemint','en'),
('imp_xiaomi-mi-portable-bluetooth-speaker','Xiaomi Mi Portable Bluetooth Speaker','en'),
('imp_xiaomi-mi-power-bank','Xiaomi Mi Power Bank','en'),
('imp_xiaomi-pad-6','Xiaomi Pad 6','en'),
('imp_xiaomi-poco-m6-pro','Xiaomi Poco M6 Pro','en'),
('imp_xiaomi-poco-x6','Xiaomi Poco X6','en'),
('imp_xiaomi-poco-x6-pro','Xiaomi Poco X6 Pro','en'),
('imp_xiaomi-redmi-12','Xiaomi Redmi 12','en'),
('imp_xiaomi-redmi-12c','Xiaomi Redmi 12C','en'),
('imp_xiaomi-redmi-13','Xiaomi Redmi 13','en'),
('imp_xiaomi-redmi-13c','Xiaomi Redmi 13C','en'),
('imp_xiaomi-redmi-a3','Xiaomi Redmi A3','en'),
('imp_xiaomi-redmi-buds-4','Xiaomi Redmi Buds 4','en'),
('imp_xiaomi-redmi-buds-4-lite','Xiaomi Redmi Buds 4 Lite','en'),
('imp_xiaomi-redmi-note-12','Xiaomi Redmi Note 12','en'),
('imp_xiaomi-redmi-note-13','Xiaomi Redmi Note 13','en')
) AS v(item_id, alias, language)
WHERE NOT EXISTS (SELECT 1 FROM public.item_aliases a WHERE a.item_id = v.item_id AND lower(a.alias) = lower(v.alias));
INSERT INTO public.item_aliases (id, item_id, alias, language)
SELECT gen_random_uuid(), v.item_id, v.alias, v.language
FROM (VALUES
('imp_xiaomi-redmi-note-13-pro','Xiaomi Redmi Note 13 Pro','en'),
('imp_xiaomi-redmi-note-13-pro-2','Xiaomi Redmi Note 13 Pro+','en'),
('imp_xiaomi-redmi-pad-se','Xiaomi Redmi Pad SE','en'),
('imp_xiaomi-smart-band','Xiaomi Smart Band','en'),
('imp_xiaomi-xiaomi-14','Xiaomi 14','en'),
('imp_yamaha-yb-125z','Yamaha YB 125Z','en'),
('imp_yamaha-yb-125z-dx','Yamaha YB 125Z DX','en'),
('imp_yamaha-ybr-125','Yamaha YBR 125','en'),
('imp_yamaha-ybr-125g','Yamaha YBR 125G','en'),
('imp_yokohama-advan','Yokohama Advan','en'),
('imp_yokohama-bluearth','Yokohama BluEarth','en'),
('imp_yokohama-geolandar','Yokohama Geolandar','en'),
('imp_zambon-fluimucil','Zambon Fluimucil','en'),
('imp_zic-m9','ZIC M9','en'),
('imp_zic-x5','ZIC X5','en'),
('imp_zic-x7','ZIC X7','en'),
('imp_zic-x9','ZIC X9','en'),
('meat_beef','بڑا گوشت / گائے','ur'),
('meat_beef','Beef','roman'),
('meat_beef','Bara Gosht','roman'),
('meat_beef','Gaye ka Gosht','roman'),
('meat_chicken','مرغی کا گوشت','ur'),
('meat_chicken','Chicken','roman'),
('meat_chicken','Murghi','roman'),
('meat_chicken','Murgh','roman'),
('meat_mutton','چھوٹا گوشت / بکرا','ur'),
('meat_mutton','Mutton','roman'),
('meat_mutton','Chota Gosht','roman'),
('meat_mutton','Bakra','roman'),
('pc_shampoo','شیمپو','ur'),
('pc_shampoo','Shampoo','roman'),
('pc_shampoo','Shampu','roman'),
('pc_shampoo','Sunsilk','roman'),
('pc_shampoo','Head & Shoulders','roman'),
('pc_soap','نہانے کا صابن','ur'),
('pc_soap','Sabun','roman'),
('pc_soap','Soap','roman'),
('pc_soap','Lux','roman'),
('pc_soap','Lifebuoy','roman'),
('pc_soap','Bath Soap','en'),
('pc_toothpaste','ٹوتھ پیسٹ','ur'),
('pc_toothpaste','Toothpaste','roman'),
('pc_toothpaste','Colgate','roman'),
('pc_toothpaste','Sensodyne','roman'),
('pc_toothpaste','Tooth Paste','roman'),
('personal_deodorant','باڈی اسپرے / ڈیوڈرینٹ','ur'),
('personal_deodorant','Deodorant','roman'),
('personal_deodorant','Body Spray','roman'),
('personal_deodorant','Axe','roman'),
('personal_deodorant','Fogg','roman'),
('personal_handwash','ہینڈ واش','ur'),
('personal_handwash','Handwash','roman'),
('personal_handwash','Hand Wash','roman'),
('personal_handwash','Liquid Soap','roman'),
('pet_cat_food','بلی کی خوراک','ur'),
('pet_cat_food','Cat Food','roman'),
('pet_cat_food','Billi ki Khorak','roman'),
('pet_cat_food','Me-O','roman'),
('pet_cat_food','Whiskas','roman'),
('seafood_fish','مچھلی','ur'),
('seafood_fish','Machli','roman'),
('seafood_fish','Machhli','roman'),
('seafood_fish','Fish','roman'),
('seafood_prawns','جھینگا','ur'),
('seafood_prawns','Jheenga','roman'),
('seafood_prawns','Prawns','roman'),
('seafood_prawns','Shrimp','roman'),
('seafood_prawns','Prawns / Shrimps','en'),
('spice_black_pepper','کالی مرچ','ur'),
('spice_black_pepper','Kali Mirch','roman'),
('spice_black_pepper','Kaali Mirch','roman'),
('spice_black_pepper','Black Pepper','en'),
('spice_cardamom','سبز الائچی','ur'),
('spice_cardamom','Elaichi','roman'),
('spice_cardamom','Choti Elaichi','roman'),
('spice_cardamom','Sabz Elaichi','roman'),
('spice_cardamom','Green Cardamom','en'),
('spice_cinnamon','دار چینی','ur'),
('spice_cinnamon','Dar Cheeni','roman'),
('spice_cinnamon','Dar Chini','roman'),
('spice_cinnamon','Dalchini','roman'),
('spice_cinnamon','Cinnamon','en'),
('spice_cloves','لونگ','ur'),
('spice_cloves','Laung','roman'),
('spice_cloves','Long','roman'),
('spice_cloves','Cloves','en'),
('spice_coriander_powder','پسا دھنیا','ur'),
('spice_coriander_powder','Pisa Dhaniya','roman'),
('spice_coriander_powder','Dhaniya Powder','roman'),
('spice_coriander_powder','Coriander Powder','en'),
('spice_cumin','سفید زیرہ','ur'),
('spice_cumin','Zeera','roman'),
('spice_cumin','Zira','roman'),
('spice_cumin','Safaid Zeera','roman'),
('spice_cumin','Cumin (Zeera)','en'),
('spice_fennel','سونف','ur'),
('spice_fennel','Saunf','roman'),
('spice_fennel','Sonf','roman'),
('spice_fennel','Fennel Seeds','en'),
('spice_fenugreek','میتھی دانہ','ur'),
('spice_fenugreek','Methi Dana','roman'),
('spice_fenugreek','Maithi','roman'),
('spice_fenugreek','Fenugreek Seeds','en'),
('spice_mixed','مصالحہ جات','ur'),
('spice_mixed','Spices','roman'),
('spice_mixed','Masala','roman'),
('spice_mixed','Garam Masala','roman'),
('spice_red_chili','سرخ مرچ پاؤڈر','ur'),
('spice_red_chili','Lal Mirch','roman'),
('spice_red_chili','Surkh Mirch','roman'),
('spice_red_chili','Kuti Lal Mirch','roman'),
('spice_red_chili','Red Chili Powder','en'),
('spice_tikka_masala','تکہ مصالحہ','ur'),
('spice_tikka_masala','Tikka Masala','roman'),
('spice_tikka_masala','BBQ Masala','roman'),
('spice_tikka_masala','Tikka Boti Masala','roman'),
('spice_turmeric','ہلدی','ur'),
('spice_turmeric','Haldi','roman'),
('spice_turmeric','Huldi','roman'),
('spice_turmeric','Turmeric Powder','en'),
('stat_ballpoint_pen','بال پوائنٹ پین','ur'),
('stat_ballpoint_pen','Pen','roman'),
('stat_ballpoint_pen','Ballpoint','roman'),
('stat_ballpoint_pen','Ball Point','roman'),
('stat_ballpoint_pen','Ballpoint Pen','en'),
('stat_notebook','رجسٹر / کاپی','ur'),
('stat_notebook','Notebook','roman'),
('stat_notebook','Register','roman'),
('stat_notebook','Copy','roman'),
('veg_coriander','دھنیا','ur'),
('veg_coriander','Dhaniya','roman'),
('veg_coriander','Dhania','roman'),
('veg_coriander','Hara Dhaniya','roman'),
('veg_coriander','Coriander','en'),
('veg_garlic','لہسن','ur'),
('veg_garlic','Lehsan','roman'),
('veg_garlic','Lahsan','roman'),
('veg_garlic','Lehsun','roman'),
('veg_garlic','Garlic','en'),
('veg_ginger','ادرک','ur'),
('veg_ginger','Adrak','roman'),
('veg_ginger','Aadrak','roman'),
('veg_ginger','Ginger','en'),
('veg_green_chili','ہری مرچ','ur'),
('veg_green_chili','Hari Mirch','roman'),
('veg_green_chili','Hri Mirch','roman'),
('veg_green_chili','Sabz Mirch','roman'),
('veg_green_chili','Hari Mirchi','roman'),
('veg_green_chili','Green Chili','en'),
('veg_lemon','لیموں','ur'),
('veg_lemon','Leemu','roman'),
('veg_lemon','Limu','roman'),
('veg_lemon','Nimbu','roman'),
('veg_lemon','Lemon','roman'),
('veg_mint','پودینہ','ur'),
('veg_mint','Podina','roman'),
('veg_mint','Pudina','roman'),
('veg_mint','Podeena','roman'),
('veg_mint','Mint','en'),
('veg_onion','پیاز','ur'),
('veg_onion','Pyaz','roman'),
('veg_onion','Pyaaz','roman'),
('veg_onion','Piyaz','roman'),
('veg_onion','Piaz','roman'),
('veg_onion','Onion','en'),
('veg_potato','آلو','ur'),
('veg_potato','Aloo','roman'),
('veg_potato','Alu','roman'),
('veg_potato','Alo','roman'),
('veg_potato','Aalu','roman'),
('veg_potato','Potato','en'),
('veg_spinach','پالک','ur'),
('veg_spinach','Palak','roman'),
('veg_spinach','Paalak','roman'),
('veg_spinach','Spinach','en'),
('veg_tomato','ٹماٹر','ur'),
('veg_tomato','Tamatar','roman'),
('veg_tomato','Tamaatar','roman'),
('veg_tomato','Tmatar','roman'),
('veg_tomato','Tomato','en')
) AS v(item_id, alias, language)
WHERE NOT EXISTS (SELECT 1 FROM public.item_aliases a WHERE a.item_id = v.item_id AND lower(a.alias) = lower(v.alias));
