// Módulo de Informações Nutricionais
const NutritionModule = {
    // Base de dados nutricionais dos produtos
    nutritionData: {
        // Brigadeiros (caixinha com 4 unidades)
        'caixinha-brigadeiro-tradicional': {
            name: 'Caixinha Brigadeiro Tradicional',
            portion: '100g (4 unidades)',
            calories: 320,
            sugar: 28,
            fat: 14,
            protein: 4,
            carbs: 42
        },
        'caixinha-brigadeiro-coco': {
            name: 'Caixinha Brigadeiro de Coco (Beijinho)',
            portion: '100g (4 unidades)',
            calories: 340,
            sugar: 30,
            fat: 16,
            protein: 3,
            carbs: 45
        },
        'caixinha-brigadeiro-churros': {
            name: 'Caixinha Brigadeiro de Churros',
            portion: '100g (4 unidades)',
            calories: 350,
            sugar: 32,
            fat: 15,
            protein: 4,
            carbs: 48
        },
        'caixinha-brigadeiro-limao': {
            name: 'Caixinha Brigadeiro de Limão',
            portion: '100g (4 unidades)',
            calories: 310,
            sugar: 26,
            fat: 13,
            protein: 3,
            carbs: 40
        },
        
        // Bolos de Pote (unidade individual)
        'bolo-pote-chocolate': {
            name: 'Bolo de Pote de Chocolate',
            portion: '120g (1 unidade)',
            calories: 280,
            sugar: 22,
            fat: 12,
            protein: 5,
            carbs: 38
        },
        'bolo-pote-morango': {
            name: 'Bolo de Pote de Morango',
            portion: '120g (1 unidade)',
            calories: 260,
            sugar: 20,
            fat: 10,
            protein: 4,
            carbs: 36
        },
        'bolo-pote-doce-leite': {
            name: 'Bolo de Pote de Doce de Leite',
            portion: '120g (1 unidade)',
            calories: 290,
            sugar: 24,
            fat: 13,
            protein: 5,
            carbs: 40
        },
        'bolo-pote-limao': {
            name: 'Bolo de Pote de Limão',
            portion: '120g (1 unidade)',
            calories: 250,
            sugar: 18,
            fat: 9,
            protein: 4,
            carbs: 34
        },
        
        // ChocoCroc (porção)
        'chococroc-chocolate': {
            name: 'ChocoCroc Chocolate',
            portion: '150g (1 porção)',
            calories: 380,
            sugar: 20,
            fat: 18,
            protein: 6,
            carbs: 48
        },
        'chococroc-caramelo': {
            name: 'ChocoCroc Caramelo',
            portion: '150g (1 porção)',
            calories: 390,
            sugar: 22,
            fat: 19,
            protein: 5,
            carbs: 50
        },
        'chococroc-morango': {
            name: 'ChocoCroc Morango',
            portion: '150g (1 porção)',
            calories: 370,
            sugar: 18,
            fat: 17,
            protein: 5,
            carbs: 46
        },
        'chococroc-doce-leite': {
            name: 'ChocoCroc Doce de Leite',
            portion: '150g (1 porção)',
            calories: 385,
            sugar: 21,
            fat: 18,
            protein: 6,
            carbs: 49
        }
    },
    
    // Função para exibir o modal de informações nutricionais
    showModal: function(productId) {
        const product = this.nutritionData[productId];
        
        if (!product) {
            console.error('Produto não encontrado:', productId);
            return;
        }
        
        // Atualizar título do modal
        document.getElementById('nutritionProductName').textContent = product.name;
        
        // Criar lista de informações nutricionais
        const nutritionList = document.getElementById('nutritionList');
        nutritionList.innerHTML = `
            <li><strong>Porção:</strong> ${product.portion}</li>
            <li><strong>Calorias:</strong> ${product.calories} kcal</li>
            <li><strong>Açúcar:</strong> ${product.sugar}g</li>
            <li><strong>Gorduras:</strong> ${product.fat}g</li>
            <li><strong>Proteínas:</strong> ${product.protein}g</li>
            <li><strong>Carboidratos:</strong> ${product.carbs}g</li>
        `;
        
        // Exibir modal
        const modal = new bootstrap.Modal(document.getElementById('nutritionModal'));
        modal.show();
    }
};

// Função global para compatibilidade
function showNutritionModal(productId) {
    NutritionModule.showModal(productId);
}

// Exportar módulo para uso global
window.NutritionModule = NutritionModule;

