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
    public async System.Threading.Tasks.Task<IActionResult> ManageInventory() 
    {
        return View(_dataContext.Products.Where(p => !p.Discontinued)); 
    }
}