using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

public class EmployeeController : Controller
{
    private DataContext _dataContext;
    private UserManager<AppUser> _userManager;
    public EmployeeController(DataContext db, UserManager<AppUser> usrMgr)
    {
        _dataContext = db;
        _userManager = usrMgr;
    }

    [Authorize(Roles = "northwind-employee")]
    [HttpGet]
    public async System.Threading.Tasks.Task<IActionResult> ManageInventory() 
    {
        return View(_dataContext.Products.Where(p => !p.Discontinued)); 
    }

    [Authorize(Roles = "northwind-employee")]
    [HttpPost]
    public async void EditProductStock([FromBody] EditProductStock payload)
    {
        _dataContext.Products.FirstOrDefault(p => p.ProductId == payload.id).UnitsInStock = payload.stock; 
        _dataContext.SaveChanges(); 
    }

    [Authorize(Roles = "northwind-employee")]
    [HttpPost]
    public async void EditProductReorderLevel([FromBody] EditProductReorderLevel payload)
    {
        _dataContext.Products.FirstOrDefault(p => p.ProductId == payload.id).ReorderLevel = payload.reorderLevel;
        _dataContext.SaveChanges(); 
    }
}